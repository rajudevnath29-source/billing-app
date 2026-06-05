const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  createExpense,
  getExpenses,
  deleteExpense,
} = require("../controllers/expenseController");

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("CREATE_EXPENSE"),
  createExpense,
);

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("VIEW_EXPENSE"),
  getExpenses,
);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("DELETE_EXPENSE"),
  deleteExpense,
);

module.exports = router;
