require("dotenv").config();
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
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
    // TODO admin passwords are unhashed given their manual addition to the db - consider adding a hashed version of their password into the DB, then bcrypt.compare() them on login

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

    // TODO in options, ensure httpOnly is true, consider sameSite and secure attributes (latter in production only)

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "Strict",
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "Strict",
      })
      .status(200)
      .json(req.user._id);
  },
];

exports.adminLogout = async (req, res, next) => {
  // revoke refresh and access tokens
  return res
    .clearCookie("accessToken", { httpOnly: true, sameSite: "Strict" })
    .clearCookie("refreshToken", { httpOnly: true, sameSite: "Strict" })
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
  // TODO go through authorization process and handle outcomes as previously. On successful authorization, get all users
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
      if (decodedRefresh.exp > 0) {
        // create new access token
        const newAccess = jwt.sign(
          { _id: decodedRefresh._id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        const clients = await returnClients();

        return res
          .cookie("accessToken", newAccess, {
            httpOnly: true,
            sameSite: "Strict",
          })
          .status(200)
          .json(clients);
      }
    }
  } catch (err) {
    console.log(err);
    return res.sendStatus(401); // TODO indicate to user they will be logged out
  }
};

const createCode = () => {
  // create a user login code that contains 2 specials, 2 numbers, 2 lowercase letters, 2 uppercase letters, and a hyphen at index 4
  // TODO while this function works great, it might be too verbose for the user. Perhaps consider an alphanumeric code in all caps for ease of use?
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

        // TODO add data to S3, make sure it syncs with the db

        const loginCode = createCode();

        const user = new User({
          name: req.body.clientname,
          email: req.body.clientemail,
          code: loginCode,
          role: "user",
          added: new Date(Date.now()).toLocaleString("en-US").split(",")[0], // mm/dd/yyyy format
        });

        const savedUser = await user.save();

        return res.status(200).json({
          name: savedUser.name,
          code: loginCode,
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
            { _id: decodedRefresh._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          // TODO create new user following same steps as above (maybe move into a HOC)

          return res
            .cookie("accessToken", newAccess, {
              httpOnly: true,
              sameSite: "Strict",
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
