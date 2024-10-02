const {
  logout,
  generatePutPresigned,
  countImagesetItems,
  generateGetPresigned,
} = require("../controllers/global/global");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // enable form data to be unpacked

// GET
router.get("/users/:id/:imageset/:start", generateGetPresigned);
router.get("/users/:id/getImagesetTotals", countImagesetItems);

// POST
router.post("/logout", logout);
router.post("/generatePutPresigned", upload.array(), generatePutPresigned);

module.exports = router;
