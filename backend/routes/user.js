const { login, getImages } = require("../controllers/user/user");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();

// POST
router.post("/login", upload.none(), login);
// GET
router.get("/:id", getImages);

module.exports = router;
