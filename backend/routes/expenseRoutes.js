const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createExpense,
  getExpenses,
  deleteExpense,
} = require("../controllers/expenseController");

// CREATE
router.post("/", authMiddleware, createExpense);

// GET
router.get("/", authMiddleware, getExpenses);

// DELETE
router.delete("/:id", authMiddleware, deleteExpense);

module.exports = router;
