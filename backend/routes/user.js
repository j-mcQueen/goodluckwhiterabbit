const { login, getUser } = require("../controllers/user/user");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();

// GET
router.get("/:id", getUser);

// POST
router.post("/login", upload.none(), login);

module.exports = router;
