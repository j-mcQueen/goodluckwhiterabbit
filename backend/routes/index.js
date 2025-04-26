const {
  adminGetClients,
  adminGetFileAndDelete,
  adminLogin,
  adminAddClient,
  adminDeleteUser,
  adminDeleteFile,
  adminUpdateUserImagesetCount,
  adminGetUserImagesetCount,
  adminAddDriveLinks,
  uploadFile,
} = require("../controllers/admin");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // enable form data to be unpacked

// GET
router.get("/users", adminGetClients);
router.get("/users/:id/:imageset/getCount", adminGetUserImagesetCount);
router.get("/users/:id/getFile/:imageset/:index", adminGetFileAndDelete);
// router.get("/users/:id/getPresigns/:imageset", getImagesetPresigns);
// POST
router.post("/login", upload.none(), adminLogin);
router.post("/add", upload.any(), adminAddClient); // using .any() here to accommodate edge cases where admin has filled out the form but has added no files yet
router.post(
  "/users/:id/updateFileCount/:imageset/:count",
  adminUpdateUserImagesetCount
);
router.post("/users/:id/addLinks", adminAddDriveLinks);
router.post("/uploadFile", upload.any(), uploadFile);
// DELETE
router.delete("/deleteUser/:id", adminDeleteUser);
router.delete("/users/:id/:imageset/:index/:filename/delete", adminDeleteFile);

module.exports = router;
