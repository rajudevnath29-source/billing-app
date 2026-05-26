const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createAccount,

  getAccounts,
} = require("../controllers/accountController");

// CREATE
router.post(
  "/",

  authMiddleware,

  createAccount,
);

// GET
router.get(
  "/",

  authMiddleware,

  getAccounts,
);

module.exports = router;
