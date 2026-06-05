const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("ADD_ITEM"),
  createItem,
);

router.get("/", authMiddleware, permissionMiddleware("VIEW_ITEM"), getItems);

router.get("/:id", authMiddleware, permissionMiddleware("VIEW_ITEM"), getItemById);

router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("EDIT_ITEM"),
  updateItem,
);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("DELETE_ITEM"),
  deleteItem,
);

module.exports = router;
