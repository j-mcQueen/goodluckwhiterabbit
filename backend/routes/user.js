const { login } = require("../controllers/user/user");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();

// POST
router.post("/login", upload.none(), login);

module.exports = router;
