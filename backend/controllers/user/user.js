require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const { body, validationResult } = require("express-validator");
const { S3Client } = require("@aws-sdk/client-s3");
const client = new S3Client({
  region: "us-east-1", // TODO move this to .env
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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
