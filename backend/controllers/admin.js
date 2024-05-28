require("dotenv").config();
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

exports.adminLogin = [
  // sanitize received input with body from express validator
  body("username")
    .trim()
    .notEmpty()
    .isLength({ min: 4 })
    .withMessage(
      "You username is too short but you shouldn't be seeing this message so tell Jack!"
    )
    .isAlphanumeric()
    .withMessage("Special characters? We don't do that here."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Enter a password, silly!")
    .isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Check failed, password wrong!"),
  asyncHandler((req, res, next) => {
    // validate form
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // there are backend validation errors
      res.json({ errors: errors.array() });
      return;
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
    // handle authentication success
    // TODO handle what data to send in success response
    // TODO check if user already has a refresh token active
    // if they do, then we can send it to client
    // if not, then create a new token

    // TODO decide what info is necessary to attach to the refresh token
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    }); // refresh token creation
    return res.status(200).json(token);
  },
];
