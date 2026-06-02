const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfileImage,
  syncAccessMasterData,
  syncPermissionsMasterData,
  syncRolesMasterData,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

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

// SYNC ROLE/PERMISSION MASTER DATA (SUPER ADMIN ONLY)
router.post(
  "/sync-access-master",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  syncAccessMasterData,
);

router.post(
  "/sync-permissions-master",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  syncPermissionsMasterData,
);

router.post(
  "/sync-roles-master",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  syncRolesMasterData,
);

// ==========================
// EXPORT
// ==========================
module.exports = router;
