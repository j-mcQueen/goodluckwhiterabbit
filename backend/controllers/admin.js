require("dotenv").config();
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const consumers = require("node:stream/consumers");
const { body, validationResult } = require("express-validator");
const { returnClients } = require("./utils/returnClients");
const { createCode } = require("./utils/createCode");
const { verifyTokens } = require("./utils/verifyTokens");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const client = new S3Client({
  region: "us-east-1", // TODO move this to .env
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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
      { expiresIn: 10 }
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
  (req, res, next) => {
    // validate form
    const errors = validationResult(req);
    if (!errors.isEmpty())
      // there are validation errors
      return res.status(401).json({ errors: errors.array() });
    else next();
  },
  async (req, res, next) => {
    // check for existing email
    try {
      const existingEmail = await User.findOne({ email: req.body.clientemail });
      if (existingEmail) throw new TypeError("Email already in use.");
      else next();
    } catch (err) {
      return err.message === "Email already in use."
        ? res.status(409).json({ status: 409 })
        : res.status(500).json({ status: 500 });
    }
  },
  async (req, res, next) => {
    const verified = await verifyTokens(req, res);

    // the below condition will always be true if verifyTokens() doesn't end the request cycle early. Just being explicit that the token is valid at this step
    if (verified) {
      const loginCode = createCode();
      // initialize array to hold any files not uploaded to S3 for notification purposes
      const unuploaded = [];

      const user = new User({
        name: req.body.clientname,
        email: req.body.clientemail,
        code: loginCode,
        url: "",
        files: {
          sneaks: req.body.sneaksAttached === "true" ? true : false,
          full: req.body.fullAttached === "true" ? true : false,
          socials: req.body.socialsAttached === "true" ? true : false,
        },
        role: "user",
        added: new Date(Date.now()).toLocaleString("en-US").split(",")[0], // mm/dd/yyyy format
      });

      // upload images to s3 if req.files has been populated
      if (req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const s3Params = {
            Bucket: "glwr-client-files",
            Key: `${user._id}/${req.files[i].fieldname}/${i}/${req.files[i].originalname}`, // ensures files are associated to a user and that each file has a key containing a reference to it's position
            Body: req.files[i].buffer,
            ContentType: req.files[i].mimetype,
          };

          // fish for upload errors and handle them
          try {
            const added = await client.send(new PutObjectCommand(s3Params));
            if (!added) throw new TypeError("File not added.");
            else continue;
          } catch (err) {
            unuploaded.push(req.files[i].originalname);
            continue;
          }
        }
      }

      const savedUser = await user.save();
      const data = {
        name: savedUser.name,
        code: loginCode,
        _id: savedUser._id,
        files: savedUser.files,
        added: savedUser.added,
      };
      if (unuploaded.length > 0) data.unuploaded = unuploaded;
      return res.status(200).json(data);
    }
  },
];

exports.adminLogout = async (req, res, next) => {
  // revoke refresh and access tokens
  return res
    .clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
    })
    .end();
};

exports.adminGetClients = async (req, res, next) => {
  try {
    const decodedAccess = jwt.verify(
      req.cookies.accessToken,
      process.env.JWT_SECRET
    );

    if (decodedAccess.exp > 0) {
      // we're in!
      const clients = await returnClients(User);
      return res.status(200).json(clients);
    } else {
      // access token expired
      const decodedRefresh = jwt.verify(
        req.cookies.refreshToken,
        process.env.JWT_SECRET
      ); // check refresh token is still valid

      if (decodedRefresh.exp > 0) {
        // create new access token
        const newAccess = jwt.sign(
          { _id: req.user._id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        const clients = await returnClients(User);

        return res
          .cookie("accessToken", newAccess, {
            httpOnly: true,
            sameSite: "Strict",
            secure: true,
          })
          .status(200)
          .json(clients);
      }
    }
  } catch (err) {
    console.log(err);
    return res.sendStatus(401);
  }
};

exports.adminGetUserImages = async (req, res, next) => {
  try {
    // TODO try block should only envelop the below variable. Catch block should be for the response to a verification error
    // this will allow following try catch blocks specific to the async operations to come. Enables targeted error handling
    const decodedAccess = jwt.verify(
      req.cookies.accessToken,
      process.env.JWT_SECRET
    );

    if (decodedAccess.exp > 0) {
      // TODO if nothing has changed since the last request, we don't need to tap S3. Determine if nothing has changed
      const images = [];
      const objects = await client.send(
        new ListObjectsV2Command({ Bucket: "glwr-client-files" })
      );

      for (let i = 0; i < objects.Contents.length; i++) {
        if (
          objects.Contents[i].Key.includes(req.params.imageset) &&
          objects.Contents[i].Key.includes(req.params.id)
        ) {
          // if the requested imageset and matching user id are present in the key of the object, this is a target file
          const file = await client.send(
            new GetObjectCommand({
              Bucket: "glwr-client-files",
              Key: objects.Contents[i].Key,
            })
          );

          // create a data URL and isolate filename to present to the client
          // this ensures we can render the image + handle editing of image order correctly on the frontend
          const imageData = {};
          const imgBuffer = (await consumers.buffer(file.Body)).toString(
            "base64"
          );

          // pass the data the frontend needs for state management
          const keyStrings = objects.Contents[i].Key.split("/");
          imageData.url = `data:${file.ContentType};base64, ${imgBuffer}`;
          imageData.position = keyStrings[2];
          imageData.filename = keyStrings[3];
          imageData.mime = file.ContentType;
          imageData.queued = true;

          images.push(imageData);
        } else continue;
      }

      // TODO sort images based on position i.e. images.sort((a,b) => a.position - b.position)
      const sorted = images.sort((a, b) => a.position - b.position);
      return res.status(200).send(sorted);
    }
  } catch (err) {
    //
    console.log(err);
  }
};

exports.adminPutImageOrder = async (req, res, next) => {
  let decodedAccess;
  try {
    decodedAccess = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);
  } catch (err) {
    // TODO what happens if our access token is not verified?
  }

  if (decodedAccess.exp > 0) {
    // retrieve all images in the bucket
    let objects;
    try {
      objects = await client.send(
        new ListObjectsV2Command({ Bucket: "glwr-client-files" })
      );
    } catch (err) {
      // TODO what happens if we can't get all our s3 objects?
    }

    let j = 0; // counter to accurately track index of provided FileList
    for (let i = 0; i < objects.Contents.length; i++) {
      // find target files
      if (
        objects.Contents[i].Key.includes(req.params.imageset) &&
        objects.Contents[i].Key.includes(req.params.id)
      ) {
        try {
          await Promise.all([
            // delete object
            client.send(
              new DeleteObjectCommand({
                Bucket: "glwr-client-files",
                Key: objects.Contents[i].Key,
              })
            ),
            // then add new image
            client.send(
              new PutObjectCommand({
                Bucket: "glwr-client-files",
                Key: `${req.params.id}/${req.params.imageset}/${[j]}/${
                  req.files[j].originalname
                }`,
                Body: req.files[j].buffer,
                ContentType: req.files[j].mimetype,
              })
            ),
          ]);
        } catch (err) {
          // TODO handle delete -> add error
          // TODO what if this happens mid loop?
          // will likely need to break the loop and display the error to the client
          console.log("oh bother", err);
        }

        j++; // increment j if both s3 commands were successful
      } else continue;
    }

    // IT WORKS!!

    // we have successfully edited the image order
    return res.sendStatus(200);
  }
};

exports.adminDeleteUser = async (req, res, next) => {
  let decodedAccess;
  try {
    decodedAccess = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);
  } catch (err) {
    // access token expired
    let decodedRefresh;
    try {
      // check if refresh token is also expired
      decodedRefresh = jwt.verify(
        req.cookies.refreshToken,
        process.env.JWT_SECRET
      );
    } catch (err) {
      // refresh token has also expired -> indicate to user they will be logged out
      return res
        .status(401)
        .json({ status: 401, message: "Refresh token expired." });
    }

    if (decodedRefresh.exp > 0) {
      // create new access token
      decodedAccess = jwt.sign(
        { _id: decodedRefresh._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // attach new access token to response cookie
      res.cookie("accessToken", decodedAccess, {
        httpOnly: true,
        sameSite: "Strict",
        secure: true,
      });
    }
  }

  if (decodedAccess.exp > 0) {
    // we're in!

    // remove user from database
    let deleted;
    try {
      deleted = await User.findByIdAndDelete(req.params.id).exec();
      if (!deleted) throw new TypeError("User deletion error.");
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message:
          "There was an error deleting the user from the database. Please refresh the page and try again.",
      });
    }

    // prevent unnecessary S3 requests
    if (
      deleted.files.sneaks === true ||
      deleted.files.socials === true ||
      deleted.files.full === true
    ) {
      // we have images to remove, so grab all files from S3
      let objects;
      try {
        objects = await client.send(
          new ListObjectsV2Command({ Bucket: "glwr-client-files" })
        );
        if (!objects || objects.Contents.length === 0)
          throw new TypeError("No files found.");
      } catch (err) {
        return res.status(500).json({
          status: 500,
          message:
            "The user has been deleted from the database, but there was an error retrieving the files from storage. Please contact Jack!",
        });
      }

      // populate an array with delete target files in preparation for removal
      const populate = (arr, object, deleted, imageset) => {
        if (
          deleted.files[imageset] === true &&
          object.Key.includes(deleted._id) &&
          object.Key.includes(imageset)
        ) {
          return arr.push({ Key: object.Key });
        }
      };

      const deleteTargets = [];
      for (let i = 0; i < objects.Contents.length; i++) {
        populate(deleteTargets, objects.Contents[i], deleted, "sneaks");
        populate(deleteTargets, objects.Contents[i], deleted, "full");
        populate(deleteTargets, objects.Contents[i], deleted, "socials");
      }

      // delete target files in one step using populated array
      try {
        const deletedFiles = await client.send(
          new DeleteObjectsCommand({
            Bucket: "glwr-client-files",
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
