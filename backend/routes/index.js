const {
  adminGetClients,
  adminLogin,
  adminAddClient,
  adminLogout,
  adminDeleteUser,
  adminGetUserImages,
  adminPutImageOrder,
} = require("../controllers/admin");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // enable form data to be unpacked

// GET
router.get("/admin/users", adminGetClients);
router.get("/admin/users/:id/getImages/:imageset", adminGetUserImages);
// POST
router.post("/admin/login", upload.none(), adminLogin);
router.post("/admin/add", upload.any(), adminAddClient); // using .any() here to accommodate edge cases where admin has filled out the form but has added no files yet
router.post("/admin/logout", adminLogout);
// PUT
router.put(
  "/admin/users/:id/editImageOrder/:imageset",
  upload.any(),
  adminPutImageOrder
);
// DELETE
router.delete("/admin/deleteUser/:id", adminDeleteUser);

module.exports = router;
