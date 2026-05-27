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

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// PROFILE
router.get("/profile", authMiddleware, getProfile);

// UPDATE PROFILE IMAGE
router.put(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  updateProfileImage,
);

module.exports = router;
