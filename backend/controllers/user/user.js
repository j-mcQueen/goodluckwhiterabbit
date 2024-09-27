require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const { body, validationResult } = require("express-validator");
const { verifyTokens } = require("../utils/verifyTokens");
// const { client } = require("../config/s3");
// const consumers = require("node:stream/consumers");
// const {
//   ListObjectsV2Command,
//   GetObjectCommand,
// } = require("@aws-sdk/client-s3");

exports.login = [
  // sanitize received input
  body("code").trim().notEmpty().isStrongPassword({
    minLength: 8,
    minUppercase: 2,
    minLowercase: 2,
    minNumbers: 2,
    minSymbols: 2,
  }),
  (req, res, next) => {
    // validate form
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // there are backend validation errors
      return res.status(401).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    try {
      const user = await User.findOne({
        code: req.body.code,
        role: "user",
      }).exec();

      if (user) {
        req.user = user;
        next();
      } else {
        // user does not exist
        throw new TypeError("User not found.");
      }
    } catch (err) {
      return err.message === "User not found."
        ? res.status(404).json({ status: 404 })
        : res.status(500).json({ status: 500 });
    }
  },
  // handle success
  (req, res, next) => {
    const refreshToken = jwt.sign(
      { _id: req.user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    ); // create refresh token

    const accessToken = jwt.sign(
      { _id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    ); // create access token

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

exports.getUser = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    try {
      const user = await User.findById({ _id: req.params.id }).exec();
      if (!user) throw new Error("500");
      else
        return res
          .status(200)
          .json({ _id: user._id, name: user.name, files: user.files });
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "Something went wrong. Please refresh the page and try again. If the problem persists, please contact GLWR.",
        logout: { status: false, path: null },
      });
    }
  }
};

// exports.getPresignsBatch = async (req, res, next) => {
//   const verified = await verifyTokens(req, res);

//   if (verified) {
//     let user;
//     try {
//       user = await User.findById(req.params.id).exec();
//       if (!user)
//         throw TypeError(
//           "The server produced an unexpected error. Please refresh the page and try again."
//         );
//     } catch (err) {
//       return res.status(404).json({
//         status: 404,
//         message: err.message,
//       });
//     }

//     const imagesets = { previews: [], full: [], socials: [] };
//     let objects;
//     try {
//       objects = await client.send(
//         new ListObjectsV2Command({ Bucket: process.env.AWS_PRIMARY_BUCKET })
//       );
//       if (!objects)
//         throw new TypeError("Failed to retrieve all images from storage.");
//     } catch (err) {
//       return res.status(404).json({ status: 404, message: err.message });
//     }

//     for (let i = 0; i < objects.Contents.length; i++) {
//       if (objects.Contents[i].Key.includes(req.params.id)) {
//         // if the matching user id is present in the key of the object, this is a target file
//         const file = await client.send(
//           new GetObjectCommand({
//             Bucket: process.env.AWS_PRIMARY_BUCKET,
//             Key: objects.Contents[i].Key,
//           })
//         );

//         // create a data URL and isolate filename to present to the client
//         // this ensures we can render the image + handle editing of image order correctly on the frontend
//         const imageData = {};
//         const imgBuffer = (await consumers.buffer(file.Body)).toString(
//           "base64"
//         );

//         // pass the data the frontend needs for state management
//         const keyStrings = objects.Contents[i].Key.split("/");
//         imageData.url = `data:${file.ContentType};base64, ${imgBuffer}`;
//         imageData.position = keyStrings[2];
//         imageData.filename = keyStrings[3];
//         imageData.mime = file.ContentType;
//         imageData.queued = true;

//         imagesets[keyStrings[1]].push(imageData); // adds imageData into the property with the corresponding imageset name
//       } else continue;
//     }

//     return res.status(200).json({ files: imagesets, name: user.name });
//   }
// };
