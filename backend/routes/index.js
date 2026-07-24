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

// DELETE
router.delete("/deleteUser/:id", adminDeleteUser);
router.delete("/users/:id/:imageset/:index/delete", adminDeleteFile);

export default router;
