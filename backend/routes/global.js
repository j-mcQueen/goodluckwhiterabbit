import express from "express";

import {
  logout,
  countImagesetItems,
  generateGetPresigned,
  generatePortfolioUrls,
  getPortfolioTaxonomy,
} from "../controllers/global/global.js";

const router = express.Router();

// GET
router.get("/portfolio/taxonomy", getPortfolioTaxonomy);
router.get(
  "/portfolio/:category/:sub/:group/:size/:start/",
  generatePortfolioUrls,
);
router.get("/users/:id/:imageset/:size/:start/:end", generateGetPresigned);
router.get("/users/:id/getImagesetTotals", countImagesetItems);

// POST
router.post("/logout", logout);

export default router;
