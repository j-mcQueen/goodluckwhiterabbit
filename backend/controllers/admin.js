require("dotenv").config();
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const consumers = require("node:stream/consumers");
const { body, validationResult } = require("express-validator");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
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

const returnClients = async () => {
  const allUsers = await User.find(
    {},
    {
      // exclude this information from the query
      email: 0,
      role: 0,
      __v: 0,
    }
  ).exec();

  return allUsers;
};

exports.adminGetClients = async (req, res, next) => {
  try {
    const decodedAccess = jwt.verify(
      req.cookies.accessToken,
      process.env.JWT_SECRET
    );

    if (decodedAccess.exp > 0) {
      // we're in!
      const clients = await returnClients();
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

        const clients = await returnClients();

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

          const imgBuffer = (await consumers.buffer(file.Body)).toString(
            "base64"
          );
          const image = `data:${file.ContentType};base64, ${imgBuffer}`;
          images.push(image);
        } else continue;
      }

      res.status(200).send(images);
    }
  } catch (err) {
    //
    console.log(err);
  }
};

const createCode = () => {
  // create a user login code that contains 2 specials, 2 numbers, 2 lowercase letters, 2 uppercase letters, and a hyphen at index 4

  let code = "";
  const characterCounts = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  };
  const characters = [
    "@#$%&!",
    "0123456789",
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ];

  const generateIndex = (arr) => {
    return Math.floor(Math.random() * arr.length);
  };

  while (code.length < 9) {
    // while the code is still being created
    if (code.length === 4) code += "-";

    const randomIndex = generateIndex(characters); // select a character set at random
    if (characterCounts[randomIndex] < 2) {
      // if we have not yet reached the character set threshold
      const randomSubIndex = generateIndex(characters[randomIndex]); // select a character within the chosen character set at random
      characterCounts[randomIndex]++;
      code += characters[randomIndex][randomSubIndex];
    }
  }

  return code;
};

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
              Key: `${user._id}/${req.files[i].fieldname}/${req.files[i].originalname}`, // ensures files are associated to a user
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

exports.adminDeleteUser = async (req, res, next) => {
  try {
    const decodedAccess = jwt.verify(
      req.cookies.accessToken,
      process.env.JWT_SECRET
    );

    if (decodedAccess.exp > 0) {
      // we're in!
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
