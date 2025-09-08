require("dotenv").config();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sharp = require("sharp");

const { body, validationResult } = require("express-validator");
const { returnClients } = require("./utils/returnClients");
const { createCode } = require("./utils/createCode");
const { verifyTokens } = require("./utils/verifyTokens");
const { updateCount } = require("./utils/updateCount");
const { s3 } = require("./config/s3");

const {
  ListObjectsV2Command,
  DeleteObjectsCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

exports.adminLogin = [
  // sanitize received input with body from express validator
  body("username")
    .trim()
    .notEmpty()
    .isLength({ min: 4 })
    .withMessage(
      "You username is too short but you shouldn't be seeing this message so tell Jack!"
    )
    .isAlphanumeric(),
  body("password").trim().notEmpty().isStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  (req, res, next) => {
    // validate form
    const errors = validationResult(req);

    if (!errors.isEmpty())
      // there are validation errors
      return res.status(401).json({ errors: errors.array() });
    else next();
  },
  // authenticate
  passport.authenticate("admin-local", { failWithError: true, session: false }),
  (err, req, res, next) => {
    // handle unauthorized
    return res.sendStatus(401);
  },
  (req, res, next) => {
    // handle login success -> generate access and refresh tokens + attach to response
    const refreshToken = jwt.sign(
      { _id: req.user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    const accessToken = jwt.sign(
      { _id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "Strict",
        secure: true,
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "Strict",
        secure: true,
      })
      .status(200)
      .json(req.user._id);
  },
];

exports.adminAddClient = [
  body("clientname").trim().notEmpty().isLength({ min: 4 }),
  body("clientemail").trim().notEmpty().isEmail(),
  body("clientcategory").trim().notEmpty(),
  (req, res, next) => {
    // validate form
    const errors = validationResult(req);
    if (!errors.isEmpty())
      // there are validation errors
      return res.status(401).json({ errors: errors.array() });
    else next();
  },
  async (req, res, next) => {
    const verified = await verifyTokens(req, res);

    // the below condition will always be true if verifyTokens() doesn't end the request cycle early. Just being explicit that the token is valid at this step
    if (verified) {
      const loginCode = createCode();

      const formattedDate = () => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);

        return `${month}/${day}/${year}`;
      };

      const user = new User({
        name: req.body.clientname,
        email: req.body.clientemail,
        code: loginCode,
        category: req.body.clientcategory,
        role: "user",
        fileCounts: {
          ...(req.body.clientsets.snapshots && { snapshots: 0 }),
          ...(req.body.clientsets.keepsake && { keepsake: 0 }),
          ...(req.body.clientsets.core && { core: 0 }),
          ...(req.body.clientsets.socials && { socials: 0 }),
        },
        added: formattedDate(),
      });

      try {
        const savedUser = await user.save();
        if (savedUser) {
          return res.status(200).json({
            _id: savedUser._id,
            name: user.name,
            code: user.code,
            category: user.category,
            added: user.added,
            fileCounts: user.fileCounts,
          });
        }
      } catch (err) {
        return res.status(500).json({
          state: true,
          status: 500,
          message:
            "There was an error adding this user into the database. Please refresh the page and try again.",
        });
      }
    }
  },
];

// TODO needed still?
exports.adminGetUserImagesetCount = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const imagesetFiles = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_PRIMARY_BUCKET,
        Prefix: `${req.params.id}/${req.params.imageset}/resized`,
      })
    );

    const count = imagesetFiles.Contents ? imagesetFiles.Contents.length : 0;
    return res.status(200).json(count);
  }
};

exports.adminUpdateUserImagesetCount = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    // retrieve user by Id and update the filecount of the active imageset passed in the request with count passed in request
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        [`fileCounts.${req.params.imageset}`]: req.params.count,
      },
      { new: true }
    );

    return res.status(200).json(updatedUser.fileCounts);
  }
};

exports.adminGetClients = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    let clients;
    try {
      clients = await returnClients(User);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message:
          "There was an error retrieving your clients. Please refresh and try again.",
      });
    }

    return res.status(200).json(clients);
  }
};

exports.adminGetFileAndDelete = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    let existingFiles = [];
    try {
      const existingResized = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Prefix: `${req.params.id}/${req.params.imageset}/resized/${req.params.index}/`,
          MaxKeys: 1,
        })
      );

      const existingOriginal = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Prefix: `${req.params.id}/${req.params.imageset}/original/${req.params.index}/`,
          MaxKeys: 1,
        })
      );

      if (!existingResized || !existingOriginal) {
        throw new Error("500");
      } else if (!existingResized.Contents && !existingOriginal.Contents) {
        // query executed and returned empty, therefore end req/res cycle
        return res.status(200).json({ success: true });
      } else {
        existingFiles.push(existingResized, existingOriginal);
      }
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error retrieving your images from S3. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    if (existingFiles[0].Contents.length > 0) {
      // there are matching pre-existing objects at the target index, so delete it in preparation for replacement
      try {
        const deleted = await s3.send(
          new DeleteObjectsCommand({
            Bucket: process.env.AWS_PRIMARY_BUCKET,
            Delete: {
              Objects: [
                { Key: existingFiles[0].Contents[0].Key },
                { Key: existingFiles[1].Contents[0].Key },
              ],
            },
          })
        );

        if (!deleted) throw new Error("500");
        else return res.status(200).json({ success: true });
      } catch (error) {
        return res.status(500).json({
          status: true,
          message:
            "There was an error removing the previous image at this position from storage. Please refresh the page and try again. Let Jack know if the problem persists!",
          logout: { status: false, path: null },
        });
      }
    } else {
      // there is no pre-existing file at the target index, so no further action is necessary
      return res.status(200).json({ success: true });
    }
  }
};

exports.adminDeleteUser = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    let deleted;
    try {
      deleted = await User.findByIdAndDelete(req.params.id).exec();
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message:
          "There was an error deleting the user from the database. Please refresh the page and try again.",
      });
    }

    // prevent unnecessary S3 requests
    if (
      deleted.fileCounts.snapshots > 0 ||
      deleted.fileCounts.keepsake > 0 ||
      deleted.fileCounts.core > 0 ||
      deleted.fileCounts.socials > 0
    ) {
      // we have images to remove, so grab all files from S3
      let objects;
      try {
        objects = await s3.send(
          new ListObjectsV2Command({ Bucket: process.env.AWS_PRIMARY_BUCKET })
        );
        if (!objects.Contents) return res.status(200).json(deleted._id); // if there are no files to delete from S3, send success response
      } catch (err) {
        return res.status(500).json({
          status: 500,
          message:
            "The user has been deleted from the database, but something went wrong when retrieving the files from storage. Let the love of your life know!",
        });
      }

      // populate an array with delete target files in preparation for removal
      const populate = (arr, object, deleted, imageset) => {
        if (
          deleted.fileCounts[imageset] > 0 &&
          object.Key.includes(deleted._id) &&
          object.Key.includes(imageset)
        ) {
          return arr.push({ Key: object.Key });
        }
      };

      const deleteTargets = [];
      for (let i = 0; i < objects.Contents.length; i++) {
        populate(deleteTargets, objects.Contents[i], deleted, "snapshots");
        populate(deleteTargets, objects.Contents[i], deleted, "keepsake");
        populate(deleteTargets, objects.Contents[i], deleted, "core");
        populate(deleteTargets, objects.Contents[i], deleted, "socials");
      }

      // delete target files in one step using populated array
      try {
        const deletedFiles = await s3.send(
          new DeleteObjectsCommand({
            Bucket: process.env.AWS_PRIMARY_BUCKET,
            Delete: { Objects: deleteTargets },
          })
        );

        if (!deletedFiles.Deleted) throw new TypeError("Error deleting files.");
        else return res.status(200).json(deleted._id); // return success response
      } catch (err) {
        return res.status(500).json({
          status: 500,
          message:
            "The user has been deleted from the database, but there was an error removing the associated files from storage. Please contact Jack!",
        });
      }
    } else return res.status(200).json(deleted._id); // no images to remove from S3, so return success response
  }
};

exports.adminDeleteFile = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    try {
      const deleteTargets = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Prefix: `${req.params.id}/${req.params.imageset}/${req.params.index}`,
        })
      );

      const deleted = await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Delete: { Objects: deleteTargets.Contents },
        })
      );

      if (deleted.Deleted.length > 0) {
        await updateCount(req.params.id, req.params.imageset, res, User, -1);
        return res.status(200).json(deleted);
      }
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "We could not delete this file from S3.",
      });
    }
  }
};

exports.uploadFile = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const large = await sharp(req.files[0].buffer)
      .resize(2400, null)
      .toFormat("webp")
      .toBuffer();

    const small = await sharp(req.files[0].buffer)
      .resize(768, null)
      .toFormat("webp")
      .toBuffer();

    // upload variations to s3
    try {
      const variations = [
        { item: small, prefix: "sm" },
        { item: large, prefix: "lg" },
        { item: req.files[0], prefix: "og" },
      ];

      await Promise.all(
        variations.map(async ({ item, prefix }) => {
          const buffer = item.buffer || item;
          const filename =
            item.originalname ||
            `${prefix}_${req.files[0].originalname.split(".jpg")[0]}.webp`;
          const contentType = item.originalname ? "image/jpeg" : "image/webp";

          const cmd = new PutObjectCommand({
            Bucket: process.env.AWS_PRIMARY_BUCKET,
            Key: `${req.body._id}/${req.body.imageset}/${req.body.index}/${prefix}/${filename}`,
            Body: buffer,
            ContentType: contentType,
          });

          await s3.send(cmd);
        })
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          "There was an error uploading this file and its variations to S3."
        );
    }

    // increment user file counts
    await updateCount(req.body._id, req.body.imageset, res, User, 1);

    return res.status(200).send(small);
  }
};
