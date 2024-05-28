require("dotenv").config();
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const Admin = require("./models/admin");
const createError = require("http-errors");
const indexRouter = require("./routes/index");
const path = require("path");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
mongoose.set("strictQuery", false);
const db = process.env.MONGODB_URI;

const main = async () => {
  try {
    await mongoose.connect(db);
  } catch (err) {
    // TODO handle database connection error
    console.log(err);
  }
};
main();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// admin login
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const admin = await Admin.findOne({ username, role: "admin" }).exec();
      const match = bcrypt.compare(password, admin.password);

      if (!admin || !match) return done(null, false);

      // if (!admin) {
      //   // if the username is not an admin, check if it's a user instead
      //   const user = await User.findOne({ username, role: "user" }).exec();
      //   const match = bcrypt.compare(password, user.password);

      //   if (!user || !match) return done(null, false); // uh oh, neither an admin OR a user tried to sign in! Either that or someone made a typo.

      //   return done(null, user);
      // } else if (!match) {
      //   // the username and their role matches an admin, but they got their password wrong
      //   return done(null, false);
      // }

      // oooh, a real admin!
      return done(null, admin);
    } catch (err) {
      return done(err);
    }
  })
);

passport.initialize();
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
