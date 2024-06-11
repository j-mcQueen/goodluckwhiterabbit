const {
  adminGetClients,
  adminLogin,
  adminAddClient,
} = require("../controllers/admin");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // enable form data to be unpacked
// TODO consider using multer-s3 package to handle image upload to S3 as a storage facility - currently they will only be stored in memory
// TODO see here for a glimpse on a how-to https://stackoverflow.com/questions/40494050/uploading-image-to-amazon-s3-using-multer-s3-nodejs

// admin dashboard routes
router.get("/admin/users", adminGetClients);
router.post("/admin/login", upload.none(), adminLogin); // text only data coming from login
router.post("/admin/add", upload.any(), adminAddClient); // using .any() here to accommodate edge cases where admin has filled out the form but has added no files yet
router.put("/", (req, res, next) => {});
router.delete("/", (req, res, next) => {});

module.exports = router;
