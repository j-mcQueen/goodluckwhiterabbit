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

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const client = new S3Client({
  region: "us-east-1",
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
  asyncHandler((req, res, next) => {
    // validate form
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // there are backend validation errors
      return res.status(401).json({ errors: errors.array() });
    }
    next();
  }),
  // authenticate with passport local
  passport.authenticate("local", { failWithError: true, session: false }),
  (err, req, res, next) => {
    // handle unauthorized
    return res.sendStatus(401);
  },
  (req, res, next) => {
    // handle login success

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

exports.adminAddClient = [
  body("clientname").trim().notEmpty().isLength({ min: 4 }),
  body("clientemail").trim().notEmpty().isEmail(),
  asyncHandler(async (req, res, next) => {
    // validate form
    const errors = validationResult(req);
    const existingEmail = await User.findOne({ email: req.body.clientemail });

    if (!errors.isEmpty()) {
      // there are backend validation errors
      return res.status(401).json({ errors: errors.array() });
    } else if (existingEmail) {
      return res.status(409).json({ errors: 409 });
    }

    next();
  }),
  async (req, res, next) => {
    try {
      const decodedAccess = jwt.verify(
        req.cookies.accessToken,
        process.env.JWT_SECRET
      );

      if (decodedAccess.exp > 0) {
        // access token is valid so authorize
        const loginCode = createCode();

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
          // TODO this could be causing a performance bottleneck
          for (let i = 0; i < req.files.length; i++) {
            // TODO include a try catch block here
            // if there is an issue with an upload, add the file to an array
            // if this array has been populated, add it to the array within the catch block (execution will continue despite catch)
            // at the end of the loop, if the array has been populated, carry on as normal
            // but when the response is sent, send with a message to indicate which files were not added and why

            const s3Params = {
              Bucket: "glwr-client-files",
              Key: `${user._id}/${req.files[i].fieldname}/${i}/${req.files[i].originalname}`, // ensures files are associated to a user and that each file has a key containing a reference to it's position
              Body: req.files[i].buffer,
              ContentType: req.files[i].mimetype,
            };

            await client.send(new PutObjectCommand(s3Params));
          }

          // create a presigned URL
          const command = new GetObjectCommand({
            Bucket: "glwr-client-files",
            Key: `${user._id}`,
          });

          // TODO not sure I need this anymore
          const url = await getSignedUrl(client, command, {
            expiresIn: 604800, // expires in 7 days
          });

          user.url = url;
          // if no url has been created, then the admin has not attached files to the client yet.
          // TODO ensure that the user is updated with the presigned URL when this happens
        }

        const savedUser = await user.save();

        return res.status(200).json({
          name: savedUser.name,
          code: loginCode,
          _id: savedUser._id,
          files: savedUser.files,
          added: savedUser.added,
        });
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

          // TODO create new user following same steps as above (maybe move into a HOC)

          return res
            .cookie("accessToken", newAccess, {
              httpOnly: true,
              sameSite: "Strict",
              secure: true,
            })
            .status(200)
            .json(req.user._id);
        }
      }
    } catch (err) {
      // TODO handle error -> either the refresh or access token is invalid - indicate to user they will be logged out
      console.log(err);
      return res.sendStatus(401);
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
    let ordered = [];
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
          // TODO now we need to populate the ordered array above to send to the client and render the updated order for visual confirmation
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

    console.log(ordered);
    // we have successfully edited the image order
    return res.status(200).send("success!!");
  }
};

exports.adminDeleteUser = async (req, res, next) => {
  try {
    const decodedAccess = jwt.verify(
      req.cookies.accessToken,
      process.env.JWT_SECRET
    );

    if (decodedAccess.exp > 0) {
      // we're in!
      // TODO delete all objects from S3 which contain the deleted user._id in the object key!
      const deleted = await User.findByIdAndDelete(req.params.id).exec();
      if (deleted._id !== undefined) return res.status(200).json(deleted._id);
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      try {
        // access token expired
        const decodedRefresh = jwt.verify(
          req.cookies.refreshToken,
          process.env.JWT_SECRET
        ); // check refresh token is still valid

        if (decodedRefresh.exp > 0) {
          // create new access token
          const newAccess = jwt.sign(
            { _id: decodedRefresh._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          const deleted = await User.findByIdAndDelete(req.params.id).exec();
          if (deleted._id !== undefined)
            return res
              .status(200)
              .cookie("accessToken", newAccess, {
                httpOnly: true,
                sameSite: "Strict",
                secure: true,
              })
              .json(deleted._id);
        }
      } catch (err) {
        if (err.name !== "TokenExpiredError") {
          return res.status(500).send("DeletionError"); // TODO indicate to user client-side that there was a deletion issue
        }
        // refresh token has also expired -> indicate to user they will be logged out
        return res.sendStatus(401);
      }
    }

    // if there is any other error, block access
    return res.sendStatus(401);
  }
};
