require("dotenv").config();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
// const consumers = require("node:stream/consumers");
const { body, validationResult } = require("express-validator");
const { returnClients } = require("./utils/returnClients");
const { createCode } = require("./utils/createCode");
const { verifyTokens } = require("./utils/verifyTokens");
const { s3 } = require("./config/s3");

const {
  // PutObjectCommand,
  // GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
        ? res.status(409).json({
            state: true,
            status: 409,
            message: "Email address already in use.",
          })
        : res.status(500).json({
            state: true,
            status: 500,
            message:
              "There was a database error. Refresh the page and try again.",
          });
    }
  },
  async (req, res, next) => {
    const verified = await verifyTokens(req, res);

    // the below condition will always be true if verifyTokens() doesn't end the request cycle early. Just being explicit that the token is valid at this step
    if (verified) {
      const loginCode = createCode();

      const user = new User({
        name: req.body.clientname,
        email: req.body.clientemail,
        code: loginCode,
        role: "user",
        fileCounts: {
          previews: 0,
          full: 0,
          socials: 0,
        },
        added: new Date(Date.now()).toLocaleString("en-US").split(",")[0], // mm/dd/yyyy format
      });

      try {
        const savedUser = await user.save();
        if (savedUser) {
          return res.status(200).json({
            _id: savedUser._id,
            name: user.name,
            code: user.code,
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

      // // initialize array to hold any files not uploaded to S3 for notification purposes
      // const rejected = [];
      // const files = { previews: 0, full: 0, socials: 0 };
      // // upload images to s3 if req.files has been populated
      // if (req.files.length > 0) {
      //   for (let i = 0; i < req.files.length; i++) {
      //     const s3Params = {
      //       Bucket: process.env.AWS_PRIMARY_BUCKET,
      //       Key: `${user._id}/${req.files[i].fieldname}/${i}/${req.files[i].originalname}`, // ensures files are associated to a user and that each file has a key containing a reference to it's position
      //       Body: req.files[i].buffer,
      //       ContentType: req.files[i].mimetype,
      //     };
      //     // fish for upload errors and handle them
      //     try {
      //       const added = await client.send(new PutObjectCommand(s3Params));
      //       if (!added) throw new TypeError("File not added.");
      //       else {
      //         files[req.files[i].fieldname]++;
      //         continue;
      //       }
      //     } catch (err) {
      //       rejected.push(req.files[i].originalname);
      //       continue;
      //     }
      //   }
      // }
      // user.files = files;
      // const savedUser = await user.save();
      // const data = {
      //   name: savedUser.name,
      //   code: loginCode,
      //   _id: savedUser._id,
      //   files: savedUser.files,
      //   added: savedUser.added,
      // };
      // if (rejected.length > 0) data.rejected = rejected;
      // return res.status(200).json(data);
    }
  },
];

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
    let existingFile;
    try {
      existingFile = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Prefix: `${req.params.id}/${req.params.imageset}/${req.params.index}/`, // bucket/userId/activeImageset/targetIndex
        })
      );

      if (!existingFile) throw new Error("500");
      if (!existingFile.Contents)
        return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error retrieving your images from S3. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    if (existingFile.Contents.length > 0) {
      // there is a pre-existing object at the target index, so delete it in preparation for replacement
      try {
        const deleted = await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_PRIMARY_BUCKET,
            Key: existingFile.Contents[0].Key,
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

// exports.getImagesetPresigns = async (req, res, next) => {
//   const verified = verifyTokens(req, res);

//   if (verified) {
//     // retrieve all S3 objects
//     let s3Objects;
//     try {
//       s3Objects = await s3.send(
//         new ListObjectsV2Command({ Bucket: process.env.AWS_PRIMARY_BUCKET })
//       );

//       if (!s3Objects.Contents) return res.status(200).json({ files: false });
//       if (!s3Objects) throw new Error("500");
//     } catch (error) {
//       return res.status(500).json({
//         status: true,
//         message:
//           "There was an error retrieving your images from S3. Please refresh the page and try again. Let Jack know if the problem persists!",
//         logout: { status: false, path: null },
//       });
//     }

//     // loop over S3 objects and generate presigns for matches
//     const presigns = [];
//     const skipped = [];
//     for (let i = 0; i < s3Objects.Contents.length; i++) {
//       if (
//         s3Objects.Contents[i].Key.includes(req.params.imageset) &&
//         s3Objects.Contents[i].Key.includes(req.params.id)
//       ) {
//         const cmd = new GetObjectCommand({
//           Bucket: process.env.AWS_PRIMARY_BUCKET,
//           Key: s3Objects.Contents[i].Key,
//         });

//         let url = "";
//         try {
//           url = await getSignedUrl(s3, cmd, { expiresIn: 600 });
//           if (!url) throw new Error("500");
//         } catch (error) {
//           // populate an array to transmit to client if signed url generation fails
//           const constituents = s3Objects.Contents[i].Key.split("/");
//           const filename = constituents.pop();
//           skipped.push(filename);
//           continue;
//         }

//         presigns.push(url);
//       }
//     }

//     return skipped.length > 0
//       ? res.status(200).json({ presigns, skipped })
//       : res.status(200).json({ presigns });
//   }
// };

// exports.adminGetUserImages = async (req, res, next) => {
//   try {
//     // TODO try block should only envelop the below variable. Catch block should be for the response to a verification error
//     // this will allow following try catch blocks specific to the async operations to come. Enables targeted error handling
//     const decodedAccess = jwt.verify(
//       req.cookies.accessToken,
//       process.env.JWT_SECRET
//     );

//     if (decodedAccess.exp > 0) {
//       // TODO if nothing has changed since the last request, we don't need to tap S3. Determine if nothing has changed
//       const images = [];
//       const objects = await client.send(
//         new ListObjectsV2Command({ Bucket: process.env.AWS_PRIMARY_BUCKET })
//       );

//       for (let i = 0; i < objects.Contents.length; i++) {
//         if (
//           objects.Contents[i].Key.includes(req.params.imageset) &&
//           objects.Contents[i].Key.includes(req.params.id)
//         ) {
//           // if the requested imageset and matching user id are present in the key of the object, this is a target file
//           const file = await client.send(
//             new GetObjectCommand({
//               Bucket: process.env.AWS_PRIMARY_BUCKET,
//               Key: objects.Contents[i].Key,
//             })
//           );

//           // create a data URL and isolate filename to present to the client
//           // this ensures we can render the image + handle editing of image order correctly on the frontend
//           const imageData = {};
//           const imgBuffer = (await consumers.buffer(file.Body)).toString(
//             "base64"
//           );

//           // pass the data the frontend needs for state management
//           const keyStrings = objects.Contents[i].Key.split("/");
//           imageData.url = `data:${file.ContentType};base64, ${imgBuffer}`;
//           imageData.position = keyStrings[2];
//           imageData.filename = keyStrings[3];
//           imageData.mime = file.ContentType;
//           imageData.queued = true;

//           images.push(imageData);
//         } else continue;
//       }

//       const sorted = images.sort((a, b) => a.position - b.position);
//       return res.status(200).send(sorted);
//     }
//   } catch (err) {
//     //
//     console.log(err);
//   }
// };

// exports.adminAddImages = async (req, res, next) => {
//   const verified = await verifyTokens(req, res);

//   if (verified) {
//     // update the user with the new number of files for that imageset

//     const rejected = [];
//     const user = await User.findById(req.params.id).exec();
//     let position = user.files[req.params.imageset];

//     for (let i = 0; i < req.files.length; i++) {
//       const s3Params = {
//         Bucket: process.env.AWS_PRIMARY_BUCKET,
//         Key: `${user._id}/${req.params.imageset}/${position}/${req.files[i].originalname}`,
//         Body: req.files[i].buffer,
//         ContentType: req.files[i].mimetype,
//       };

//       try {
//         const added = await client.send(new PutObjectCommand(s3Params));
//         if (!added) throw new TypeError("File not added.");
//         else {
//           position++;
//           continue;
//         }
//       } catch (err) {
//         rejected.push(req.files[i].originalname);
//         continue;
//       }
//     }

//     // ensure user record in db contains correct number of files for each imageset
//     const updated = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: {
//           [req.params.imageset]: req.params.imageset + req.files.length - 1,
//         },
//       },
//       { new: true }
//     );

//     // TODO send the full array with the newly added images to the client
//     // might need to follow similar process as shown from lines 221 above

//     console.log(updated);
//     return res.status(200).json([]);
//   }
// };

// exports.adminPutImageOrder = async (req, res, next) => {
//   let decodedAccess;
//   try {
//     decodedAccess = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);
//   } catch (err) {
//     // TODO what happens if our access token is not verified?
//   }

//   if (decodedAccess.exp > 0) {
//     // retrieve all images in the bucket
//     let objects;
//     try {
//       objects = await client.send(
//         new ListObjectsV2Command({ Bucket: process.env.AWS_PRIMARY_BUCKET })
//       );
//     } catch (err) {
//       // TODO what happens if we can't get all our s3 objects?
//     }

//     let j = 0; // counter to accurately track index of provided FileList
//     for (let i = 0; i < objects.Contents.length; i++) {
//       // find target files
//       if (
//         objects.Contents[i].Key.includes(req.params.imageset) &&
//         objects.Contents[i].Key.includes(req.params.id)
//       ) {
//         try {
//           await Promise.all([
//             // delete object
//             client.send(
//               new DeleteObjectCommand({
//                 Bucket: process.env.AWS_PRIMARY_BUCKET,
//                 Key: objects.Contents[i].Key,
//               })
//             ),
//             // then add new image
//             client.send(
//               new PutObjectCommand({
//                 Bucket: process.env.AWS_PRIMARY_BUCKET,
//                 Key: `${req.params.id}/${req.params.imageset}/${[j]}/${
//                   req.files[j].originalname
//                 }`,
//                 Body: req.files[j].buffer,
//                 ContentType: req.files[j].mimetype,
//               })
//             ),
//           ]);
//         } catch (err) {
//           // TODO handle delete -> add error
//           // TODO what if this happens mid loop?
//           // will likely need to break the loop and display the error to the client
//           console.log("oh bother", err);
//         }

//         j++; // increment j if both s3 commands were successful
//       } else continue;
//     }

//     // IT WORKS!!

//     // we have successfully edited the image order
//     return res.sendStatus(200);
//   }
// };

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
      deleted.fileCounts.previews > 0 ||
      deleted.fileCounts.socials > 0 ||
      deleted.fileCounts.full > 0
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
        populate(deleteTargets, objects.Contents[i], deleted, "previews");
        populate(deleteTargets, objects.Contents[i], deleted, "full");
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
    const deleted = await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_PRIMARY_BUCKET,
        Key: `${req.params.id}/${req.params.imageset}/${req.params.index}/${req.params.filename}`,
      })
    );

    return res.status(200).json(deleted);
  }
};
