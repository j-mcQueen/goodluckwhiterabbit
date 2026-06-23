import path from "path";
import "dotenv/config";

// middleware + utils
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import passport from "passport";
import createError from "http-errors";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import helmet from "helmet";

// models
import Admin from "./models/admin.js";

// routes
import globalRouter from "./routes/global.js";
import indexRouter from "./routes/index.js";
import userRouter from "./routes/user.js";

import { Strategy as LocalStrategy } from "passport-local";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  // 100 requests max per minute
});

app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://goodluckwhiterabbit.com",
      "https://www.goodluckwhiterabbit.com",
    ],
    credentials: true,
  }),
);
app.use(limiter);
app.use(helmet());
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
      // either the admin search or password matches returned false so send an unauthorized response
      return done(err);
    }
  }),
);

passport.initialize();
app.use("/api", globalRouter);
app.use("/api/admin", indexRouter);
app.use("/api/user", userRouter);

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

export default app;
