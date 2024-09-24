const {
  logout,
  generatePresignedUrl,
} = require("../controllers/global/global");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // enable form data to be unpacked

// POST
router.post("/logout", logout);
router.post("/generateUrl", upload.array(), generatePresignedUrl);

module.exports = router;
