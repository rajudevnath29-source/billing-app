const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// ALL USERS
router.get("/", authMiddleware, roleMiddleware(["SUPER_ADMIN"]), getUsers);

// SINGLE USER
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  getSingleUser,
);

// UPDATE USER
router.put("/:id", authMiddleware, roleMiddleware(["SUPER_ADMIN"]), updateUser);

// DELETE USER
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  deleteUser,
);

module.exports = router;
