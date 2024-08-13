const { logout } = require("../controllers/global/global");
const express = require("express");
const router = express.Router();

// POST
router.post("/logout", logout);

module.exports = router;
