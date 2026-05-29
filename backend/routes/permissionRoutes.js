const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  createPermission,
  getPermissions,
} = require("../controllers/permissionController");

// CREATE
router.post(
  "/",
  authMiddleware,
  permissionMiddleware("MANAGE_PERMISSIONS"),
  createPermission,
);

// GET
router.get(
  "/",
  authMiddleware,
  permissionMiddleware("MANAGE_PERMISSIONS"),
  getPermissions,
);

module.exports = router;
