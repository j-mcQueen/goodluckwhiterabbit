require("dotenv").config();
const asyncHandler = require("express-async-handler");
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
    } else {
      res.json("The server has responded with the NICE status!");
    }
    // next();
  }),
  // authenticate with passport local
  // handle authentication error
  // handle authentication success
];
