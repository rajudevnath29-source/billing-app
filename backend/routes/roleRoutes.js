const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  createRole,
  getRoles,
  updateRole,
} = require("../controllers/roleController");

// CREATE
router.post(
  "/",
  authMiddleware,
  permissionMiddleware("MANAGE_ROLES"),
  createRole,
);

// GET
router.get("/", authMiddleware, permissionMiddleware("MANAGE_ROLES"), getRoles);

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("MANAGE_ROLES"),
  updateRole,
);

module.exports = router;
