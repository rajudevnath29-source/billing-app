const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

// CREATE ITEM (ADMIN + MANAGER)
router.post(
  "/",
  authMiddleware,
  // roleMiddleware(["SUPER_ADMIN", "ITEM_MANAGER"]),
  createItem,
);

// GET ALL ITEMS (LOGIN REQUIRED)
router.get("/", authMiddleware, getItems);

// GET SINGLE ITEM
router.get("/:id", authMiddleware, getItemById);

// UPDATE ITEM
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN", "ITEM_MANAGER"]),
  updateItem,
);

// DELETE ITEM (ONLY SUPER ADMIN)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  deleteItem,
);

module.exports = router;
