import express from "express";

import {
  logout,
  countImagesetItems,
  generateGetPresigned,
  generatePortfolioUrls,
  generatePortfolioLayoutUrls,
  getPortfolioGroupHasMemo,
  getPortfolioTaxonomy,
} from "../controllers/global/global.js";

const router = express.Router();

// GET
router.get("/portfolio/taxonomy", getPortfolioTaxonomy);
router.get(
  "/portfolio/:category/:sub/:group/:size/:start/",
  generatePortfolioUrls,
);
router.get(
  "/portfolio/:category/:sub/:groupId/layout/:size/:start",
  generatePortfolioLayoutUrls,
);
router.get(
  "/portfolio/:category/:sub/:groupId/hasMemo",
  getPortfolioGroupHasMemo,
);
router.get("/users/:id/:imageset/:size/:start/:end", generateGetPresigned);
router.get("/users/:id/getImagesetTotals", countImagesetItems);

// POST
router.post("/logout", logout);

export default router;
