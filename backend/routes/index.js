const { adminLogin } = require("../controllers/admin");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // enable form data to be unpacked

router.get("/", (req, res, next) => {});
router.post("/", upload.none(), adminLogin); // text only data coming from login
router.put("/", (req, res, next) => {});
router.delete("/", (req, res, next) => {});

module.exports = router;
