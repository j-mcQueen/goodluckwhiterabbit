const {
  logout,
  generatePutPresigned,
} = require("../controllers/global/global");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // enable form data to be unpacked

// POST
router.post("/logout", logout);
router.post("/generatePutPresigned", upload.array(), generatePutPresigned);

module.exports = router;
