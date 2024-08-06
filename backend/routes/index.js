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
router.get("/users", adminGetClients);
router.get("/users/:id/getImages/:imageset", adminGetUserImages);
// POST
router.post("/login", upload.none(), adminLogin);
router.post("/add", upload.any(), adminAddClient); // using .any() here to accommodate edge cases where admin has filled out the form but has added no files yet
router.post("/logout", adminLogout);
// PUT
router.put(
  "/users/:id/editImageOrder/:imageset",
  upload.any(),
  adminPutImageOrder
);
// DELETE
router.delete("/deleteUser/:id", adminDeleteUser);

module.exports = router;
