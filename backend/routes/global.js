import express from "express";
import multer from "multer";

import {
  logout,
  generatePutPresigned,
  countImagesetItems,
  generateGetPresigned,
  generatePortfolioUrls,
} from "../controllers/global/global.js";

const router = express.Router();
const upload = multer(); // enable form data to be unpacked

// GET
router.get(
  "/portfolio/:category/:sub/:group/:size/:start/",
  generatePortfolioUrls,
);
router.get("/users/:id/:imageset/:size/:start/:end", generateGetPresigned);
router.get("/users/:id/getImagesetTotals", countImagesetItems);

// POST
router.post("/logout", logout);
router.post("/generatePutPresigned", upload.array(), generatePutPresigned);

export default router;
