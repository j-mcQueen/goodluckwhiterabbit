require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const { body, validationResult } = require("express-validator");
const { verifyTokens } = require("../utils/verifyTokens");

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
      return res.status(401).json({ status: 401, errors: errors.array() });
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
        return res.status(200).json({
          _id: user._id,
          name: user.name,
          fileCounts: user.fileCounts,
        });
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
