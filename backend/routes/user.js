import express from "express";
import multer from "multer";

import {
  login,
  getUser,
  generateOriginalGetPresigned,
  downloadAll,
} from "../controllers/user/user.js";

const router = express.Router();
const upload = multer();

// GET
router.get("/:id", getUser);
router.get("/:id/:imageset/ogs", downloadAll);
router.get("/:id/:imageset/og/:index", generateOriginalGetPresigned);

// POST
router.post("/login", upload.none(), login);

export default router;
