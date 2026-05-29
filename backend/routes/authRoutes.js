const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfileImage,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

// ==========================
// AUTH
// ==========================

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// ==========================
// PROFILE
// ==========================

// GET PROFILE
router.get("/profile", authMiddleware, getProfile);

// UPDATE PROFILE IMAGE
router.put(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  updateProfileImage,
);

// ==========================
// EXPORT
// ==========================
module.exports = router;
