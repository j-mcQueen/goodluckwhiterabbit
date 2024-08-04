const { login } = require("../controllers/user");
const express = require("express");
const router = express.Router();
const upload = multer();

// POST
router.post("/user", upload.none(), login);

module.exports = router;
