require("dotenv").config();

// middleware + utils
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");
const passport = require("passport");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");

// models
const Admin = require("./models/admin");
const User = require("./models/user");

// routes
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");

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

app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:4173"],
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// admin login
passport.use(
  "admin-local",
  new LocalStrategy(async (username, password, done) => {
    try {
      const admin = await Admin.findOne({ username, role: "admin" }).exec();
      const match = bcrypt.compare(password, admin.password);

      if (!admin || !match) return done(null, false);

      // oooh, a real admin!
      return done(null, admin);
    } catch (err) {
      // TODO either the admin search or password matches returned false so send an unauthorized response
      return done(err);
    }
  })
);

passport.use(
  "user-local",
  new LocalStrategy(async (code, done) => {
    try {
      const user = await User.findOne({ code, role: "user" }).exec();
      if (user.code !== code) return done(null, false);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.initialize();
app.use("/", indexRouter);
app.use("/user", userRouter);

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
