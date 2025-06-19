const {
  login,
  getUser,
  generateOriginalGetPresigned,
  downloadAll,
} = require("../controllers/user/user");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();

// GET
router.get("/:id", getUser);
router.get("/:id/:imageset/ogs", downloadAll);
router.get("/:id/:imageset/og/:index", generateOriginalGetPresigned);

// POST
router.post("/login", upload.none(), login);

module.exports = router;
