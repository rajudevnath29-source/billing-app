const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  getUsers,
  getSingleUser,
  updateUser,
  updateUserAccess,
  deleteUser,
} = require("../controllers/userController");

// GET USERS
router.get("/", authMiddleware, permissionMiddleware("VIEW_USER"), getUsers);

// GET SINGLE USER
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("VIEW_USER"),
  getSingleUser,
);

// UPDATE USER
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("EDIT_USER"),
  updateUser,
);

// UPDATE ACCESS
router.put(
  "/:id/access",
  authMiddleware,
  permissionMiddleware("MANAGE_USER_ACCESS"),
  updateUserAccess,
);

// DELETE USER
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("DELETE_USER"),
  deleteUser,
);

module.exports = router;
