import fs from "fs";
import express from "express";
import multer from "multer";

import {
  adminGetClients,
  adminLogin,
  adminAddClient,
  adminDeleteUser,
  adminDeleteFile,
  adminSwapFiles,
  adminUpdateUserImagesetCount,
  adminGetUserImagesetCount,
  bulkUpload,
  uploadFile,
} from "../controllers/admin.js";
import {
  adminGetPortfolioTaxonomy,
  adminAddSubcategory,
  adminDeleteSubcategory,
  adminAddGroup,
  adminDeleteGroup,
  adminUploadPortfolioImage,
  adminBulkUploadPortfolioImages,
  adminDeletePortfolioImage,
  adminSwapPortfolioImages,
  adminSwapPortfolioLayout,
  adminMovePortfolioLayoutItem,
  adminRepairPortfolioLayout,
  adminUpdatePortfolioGroupCount,
  adminGetPortfolioGroupImages,
  adminGetPortfolioGroupLayout,
  adminCreatePortfolioMemo,
  adminGetPortfolioMemo,
  adminUpdatePortfolioMemo,
  adminDeletePortfolioMemo,
} from "../controllers/portfolioAdmin.js";

const router = express.Router();
const upload = multer(); // enable form data to be unpacked
const diskUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync("/tmp/uploads", { recursive: true });
      cb(null, "/tmp/uploads");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  }),
}); // necessary for a readstream and improved performance in bulk uploading

// GET
router.get("/users", adminGetClients);
router.get("/users/:id/:imageset/getCount", adminGetUserImagesetCount);
router.get("/portfolio/taxonomy", adminGetPortfolioTaxonomy);
router.get(
  "/portfolio/:category/:sub/:groupId/:size/:start/",
  adminGetPortfolioGroupImages,
);
router.get("/portfolio/memo/:memoId", adminGetPortfolioMemo);
router.get(
  "/portfolio/:category/:sub/:groupId/layout/:size/:start",
  adminGetPortfolioGroupLayout,
);

// POST
router.post("/login", upload.none(), adminLogin);
router.post("/add", upload.any(), adminAddClient); // using .any() here to accommodate edge cases where admin has filled out the form but has added no files yet
router.post(
  "/users/:id/updateFileCount/:imageset/:count",
  adminUpdateUserImagesetCount,
);
router.post("/uploadFile", upload.any(), uploadFile);
router.post("/users/:id/:imageset/bulkUpload", diskUpload.any(), bulkUpload);
router.post("/users/:id/:imageset/swap/:from/:to", adminSwapFiles);
router.post("/portfolio/:category/subcategories", adminAddSubcategory);
router.post("/portfolio/subcategories/:subId/groups", adminAddGroup);
router.post(
  "/portfolio/:category/:sub/:groupId/uploadFile",
  upload.any(),
  adminUploadPortfolioImage,
);
router.post(
  "/portfolio/:category/:sub/:groupId/bulkUpload",
  diskUpload.any(),
  adminBulkUploadPortfolioImages,
);
router.post(
  "/portfolio/:category/:sub/:groupId/swap/:from/:to",
  adminSwapPortfolioImages,
);
router.post(
  "/portfolio/:category/:sub/:groupId/layout/swap/:from/:to",
  adminSwapPortfolioLayout,
);
router.post(
  "/portfolio/:category/:sub/:groupId/layout/move/:from/:to",
  adminMovePortfolioLayoutItem,
);
router.post(
  "/portfolio/:category/:sub/:groupId/layout/repair",
  adminRepairPortfolioLayout,
);
router.post(
  "/portfolio/subcategories/:subId/groups/:groupId/updateCount/:count",
  adminUpdatePortfolioGroupCount,
);
router.post("/portfolio/:category/:sub/:groupId/memo", adminCreatePortfolioMemo);
router.post("/portfolio/memo/:memoId", adminUpdatePortfolioMemo);

// DELETE
router.delete("/deleteUser/:id", adminDeleteUser);
router.delete("/users/:id/:imageset/:index/delete", adminDeleteFile);
router.delete("/portfolio/subcategories/:subId", adminDeleteSubcategory);
router.delete(
  "/portfolio/subcategories/:subId/groups/:groupId",
  adminDeleteGroup,
);
router.delete(
  "/portfolio/:category/:sub/:groupId/:position/delete",
  adminDeletePortfolioImage,
);
router.delete(
  "/portfolio/:category/:sub/:groupId/memo/:memoId",
  adminDeletePortfolioMemo,
);

export default router;
