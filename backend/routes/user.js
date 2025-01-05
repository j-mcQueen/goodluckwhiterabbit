const {
  login,
  getUser,
  generateOriginalGetPresigned,
} = require("../controllers/user/user");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();

// GET
router.get("/:id", getUser);
router.get(
  "/:id/:imageset/original/:index/:filename",
  generateOriginalGetPresigned
);

// POST
router.post("/login", upload.none(), login);

module.exports = router;
