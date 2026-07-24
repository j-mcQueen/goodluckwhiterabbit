import "dotenv/config";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import sharp from "sharp";
import pLimit from "p-limit";

import { body, validationResult } from "express-validator";
import { createReadStream } from "fs";
import { returnClients } from "./utils/returnClients.js";
import { createCode } from "./utils/createCode.js";
import { verifyTokens } from "./utils/verifyTokens.js";
import { updateCount } from "./utils/updateCount.js";
import { unlink } from "fs/promises";
import { s3 } from "./config/s3.js";
import {
  ListObjectsV2Command,
  DeleteObjectsCommand,
  PutObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";

const limit = pLimit(3);

export const adminLogin = [
  // sanitize received input with body from express validator
  body("username")
    .trim()
    .notEmpty()
    .isLength({ min: 4 })
    .withMessage(
      "You username is too short but you shouldn't be seeing this message so tell Jack!",
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
      },
    );

    const accessToken = jwt.sign(
      { _id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
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

export const adminAddClient = [
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

export const adminGetUserImagesetCount = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const imagesetFiles = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_PRIMARY_BUCKET,
        Prefix: `${req.params.id}/${req.params.imageset}/resized`,
      }),
    );

    const count = imagesetFiles.Contents ? imagesetFiles.Contents.length : 0;
    return res.status(200).json(count);
  }
};

export const adminUpdateUserImagesetCount = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    // retrieve user by Id and update the filecount of the active imageset passed in the request with count passed in request
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        [`fileCounts.${req.params.imageset}`]: req.params.count,
      },
      { new: true },
    );

    return res.status(200).json(updatedUser.fileCounts);
  }
};

export const adminGetClients = async (req, res, next) => {
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

export const adminDeleteUser = async (req, res, next) => {
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
          new ListObjectsV2Command({ Bucket: process.env.AWS_PRIMARY_BUCKET }),
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
          }),
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

export const adminDeleteFile = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    try {
      const deleteTargets = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Prefix: `${req.params.id}/${req.params.imageset}/${req.params.index}/`,
        }),
      );

      if (!deleteTargets.Contents || deleteTargets.Contents.length === 0) {
        return res.status(200).json({ success: true });
      }

      const deleted = await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Delete: { Objects: deleteTargets.Contents },
        }),
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

export const adminSwapFiles = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const { id, imageset, from, to } = req.params;

    if (from === to) return res.status(200).json({ success: true });

    const bucket = process.env.AWS_PRIMARY_BUCKET;
    const sourcePrefix = `${id}/${imageset}/${from}/`;
    const destPrefix = `${id}/${imageset}/${to}/`;
    const rest = (key, prefix) => key.slice(prefix.length);
    const encodeKey = (key) => key.split("/").map(encodeURIComponent).join("/");
    const copy = (sourceKey, destinationKey) =>
      s3.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${encodeKey(sourceKey)}`,
          Key: destinationKey,
        }),
      );

    try {
      const [sourceObjects, destObjects] = await Promise.all([
        s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: sourcePrefix })),
        s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: destPrefix })),
      ]);

      if (!sourceObjects.Contents || sourceObjects.Contents.length === 0) {
        return res
          .status(404)
          .json({ status: 404, message: "There is nothing to move at the source position." });
      }

      const newKeys = new Set(
        sourceObjects.Contents.map((obj) => `${destPrefix}${rest(obj.Key, sourcePrefix)}`),
      );
      let tempKeys = [];

      if (!destObjects.Contents || destObjects.Contents.length === 0) {
        // target slot is empty - plain move, no collision is possible
        await Promise.all(
          sourceObjects.Contents.map((obj) =>
            copy(obj.Key, `${destPrefix}${rest(obj.Key, sourcePrefix)}`),
          ),
        );
      } else {
        // target slot is occupied - stage its files first so a coincidentally
        // shared filename between the two positions can't clobber content
        // before it has been copied out
        const tempPrefix = `${id}/${imageset}/__swap-${Date.now()}__/`;
        tempKeys = destObjects.Contents.map(
          (obj) => `${tempPrefix}${rest(obj.Key, destPrefix)}`,
        );

        await Promise.all(destObjects.Contents.map((obj, i) => copy(obj.Key, tempKeys[i])));
        await Promise.all(
          sourceObjects.Contents.map((obj) =>
            copy(obj.Key, `${destPrefix}${rest(obj.Key, sourcePrefix)}`),
          ),
        );
        await Promise.all(
          tempKeys.map((key, i) =>
            copy(key, `${sourcePrefix}${rest(destObjects.Contents[i].Key, destPrefix)}`),
          ),
        );

        destObjects.Contents.forEach((obj) =>
          newKeys.add(`${sourcePrefix}${rest(obj.Key, destPrefix)}`),
        );
      }

      // only remove keys that don't now hold content we just wrote there
      const oldKeys = [
        ...sourceObjects.Contents.map((obj) => obj.Key),
        ...(destObjects.Contents || []).map((obj) => obj.Key),
      ];
      const staleKeys = oldKeys.filter((key) => !newKeys.has(key));

      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: [...staleKeys, ...tempKeys].map((Key) => ({ Key })) },
        }),
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "We could not move this file in storage.",
      });
    }
  }
};

export const uploadFile = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const file = req.files[0];
    const prefix = `${req.body._id}/${req.body.imageset}/${req.body.index}/`;

    const [large, small, existing] = await Promise.all([
      sharp(file.buffer).resize(2400, null).toFormat("webp").toBuffer(),
      sharp(file.buffer).resize(768, null).toFormat("webp").toBuffer(),
      s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Prefix: prefix,
        }),
      ),
    ]);

    const isReplace = Boolean(existing.Contents && existing.Contents.length > 0);

    // upload variations to s3
    let newKeys = [];
    try {
      const variations = [
        { item: small, prefix: "sm" },
        { item: large, prefix: "lg" },
        { item: req.files[0], prefix: "og" },
      ];

      newKeys = await Promise.all(
        variations.map(async ({ item, prefix: sizePrefix }) => {
          const buffer = item.buffer || item;
          const filename =
            item.originalname ||
            `${sizePrefix}_${req.files[0].originalname.split(".jpg")[0]}.webp`;
          const contentType = item.originalname ? "image/jpeg" : "image/webp";
          const key = `${prefix}${sizePrefix}/${filename}`;

          const cmd = new PutObjectCommand({
            Bucket: process.env.AWS_PRIMARY_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
          });

          await s3.send(cmd);
          return key;
        }),
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          "There was an error uploading this file and its variations to S3.",
        );
    }

    if (isReplace) {
      // remove any pre-existing files at this index that weren't already
      // overwritten in place by the upload above
      const staleKeys = existing.Contents.map((obj) => obj.Key).filter(
        (key) => !newKeys.includes(key),
      );

      if (staleKeys.length > 0) {
        try {
          await s3.send(
            new DeleteObjectsCommand({
              Bucket: process.env.AWS_PRIMARY_BUCKET,
              Delete: { Objects: staleKeys.map((Key) => ({ Key })) },
            }),
          );
        } catch (error) {
          // the new image uploaded successfully; a lingering orphan here
          // is a lesser problem than failing a request that otherwise succeeded
          console.log("error", error);
        }
      }
    } else {
      // only a genuinely new image should grow the imageset's file count
      await updateCount(req.body._id, req.body.imageset, res, User, 1);
    }

    return res.status(200).send(small);
  }
};

export const bulkUpload = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const sortedFiles = [...req.files].sort((a, b) => {
      // order inbound files based on filename suffix ("01" -> "XXX")
      const extractIndex = (filename) => {
        const match = filename.match(/_(\d+)\./);
        return match ? parseInt(match[1]) : 0;
      };

      return extractIndex(a.originalname) - extractIndex(b.originalname);
    });

    const tempPaths = sortedFiles.map((file) => file.path); // for clean-up only
    const existingCount = Number(req.query.fileCount) || 0;

    const uploadToS3 = async (buffer, key, contentType, contentLength) => {
      return await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ...(contentLength && { ContentLength: contentLength }),
        }),
      );
    };

    try {
      // begin upload and track any files which fail without triggering catch
      const settled = await Promise.allSettled(
        sortedFiles.map((file, index) =>
          // cap concurrent processing and minimise resource (CPU/memory/network) usage
          limit(async () => {
            // concurrent resize -> faster completion
            const [largeBuffer, smallBuffer] = await Promise.all([
              sharp(file.path).resize(2400, null).toFormat("webp").toBuffer(),
              sharp(file.path).resize(768, null).toFormat("webp").toBuffer(),
            ]);

            const key = (size) =>
              `${req.params.id}/${req.params.imageset}/${index + existingCount}/${size}/${file.originalname}`;

            // concurrent upload -> faster completion
            await Promise.all([
              uploadToS3(
                createReadStream(file.path),
                key("og"),
                file.mimetype,
                file.size,
              ),
              uploadToS3(largeBuffer, key("lg"), "image/webp"),
              uploadToS3(smallBuffer, key("sm"), "image/webp"),
            ]);

            // no return - nothing meaningful to use outwith this scope
          }),
        ),
      );

      // make it easy on the frontend to display successfully upload files
      const succeeded = settled
        .map((item, i) =>
          item.status === "fulfilled" ? sortedFiles[i].originalname : null,
        )
        .filter(Boolean);

      // supply any failed uploads for user notification
      const failed = settled
        .map((item, i) =>
          item.status === "rejected" ? sortedFiles[i].originalname : null,
        )
        .filter(Boolean);

      // keep database info current
      await updateCount(
        req.params.id,
        req.params.imageset,
        res,
        User,
        succeeded.length,
      );

      res.json({
        firstTen: succeeded.slice(0, 10),
        failed,
        newCount: succeeded.length + existingCount,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Upload failed", detail: error.message });
    } finally {
      // wipe temp files created as part creating + using a stream
      await Promise.all(
        tempPaths.map((path) =>
          unlink(path).catch((error) => {
            if (error.code !== "ENOENT")
              console.error("Cleanup failed:", error);
          }),
        ),
      );
    }
  }
};
