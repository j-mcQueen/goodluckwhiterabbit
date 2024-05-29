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
    // TODO handle what data to send in success response
    // TODO check if user already has a refresh token active -> can be found in cookies part of the request
    // if they do, TWO PATHWAYS:
    // 1. User is logging in: new refresh token needed, so create one and add a refresh token cookie to the response along with the data that is needed on the frontend (for login, we only need 200 status response/ successful auth)
    // 2. If user is logged in (refresh token active), they are making a separate request, so check if there is also an access token (shorter lived) in the request's cookies
    // 2a. If there's an access token, check if it's valid and not expired.
    // 2ai. If all checks pass, then send requested data with a 200 response.
    // 2aii. If it's expired, then create a new access token
    // 2aiii. If it's invalid, send 401 unauthorized
    // 2b. If there is no access token, add one to the cookie that gets sent in the response

    // TODO decide what info is necessary to attach to the refresh token

    const refreshToken = jwt.sign(
      { _id: req.user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    ); // create refresh token

    // TODO in options, ensure httpOnly is true, consider sameSite and secure attributes (latter in production only)
    // TODO delete refresh cookie on logout

    return res
      .cookie("refreshToken", refreshToken, { httpOnly: true })
      .status(200)
      .json(req.user._id);
  },
];
