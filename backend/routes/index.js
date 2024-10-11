const {
  adminGetClients,
  adminGetFileAndDelete,
  adminLogin,
  adminAddClient,
  adminDeleteUser,
  adminDeleteFile,
  adminUpdateUserImagesetCount,
  // adminGetUserImages,
  // adminAddImages,
  // adminPutImageOrder,
  // getImagesetPresigns,
} = require("../controllers/admin");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // enable form data to be unpacked

// GET
router.get("/users", adminGetClients);
router.get("/users/:id/getFile/:imageset/:index", adminGetFileAndDelete);
// router.get("/users/:id/getPresigns/:imageset", getImagesetPresigns);
// POST
router.post("/login", upload.none(), adminLogin);
router.post("/add", upload.any(), adminAddClient); // using .any() here to accommodate edge cases where admin has filled out the form but has added no files yet
router.post(
  "/users/:id/updateFileCount/:imageset/:count",
  adminUpdateUserImagesetCount
);
// PUT
// router.put(
//   "/users/:id/editImageOrder/:imageset",
//   upload.any(),
//   adminPutImageOrder
// );
// router.put("/users/:id/addImages/:imageset", upload.any(), adminAddImages);
// DELETE
router.delete("/deleteUser/:id", adminDeleteUser);
router.delete("/users/:id/:imageset/:index/:filename/delete", adminDeleteFile);

module.exports = router;
