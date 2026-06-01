const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPayment,
  getPayments,
  deletePayment,
} = require("../controllers/paymentController");

// CREATE
router.post("/", authMiddleware, createPayment);

// GET
router.get("/", authMiddleware, getPayments);

//Delete
router.delete("/:id", authMiddleware, deletePayment);

module.exports = router;
