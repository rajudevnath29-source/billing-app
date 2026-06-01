const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createAccount,
  getAccounts,
  deleteAccount,
} = require("../controllers/accountController");

// CREATE
router.post("/", authMiddleware, createAccount);

// GET
router.get("/", authMiddleware, getAccounts);

router.delete("/:id", authMiddleware, deleteAccount);

module.exports = router;
