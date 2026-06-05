const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const { getStockHistory } = require("../controllers/stockHistoryController");

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("VIEW_STOCK"),
  getStockHistory,
);

module.exports = router;
