const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createVoucher,
  getVouchers,
  deleteVoucher,
} = require("../controllers/voucherController");

// CREATE
router.post("/", authMiddleware, createVoucher);

// GET
router.get("/", authMiddleware, getVouchers);

// DELETE
router.delete("/:id", authMiddleware, deleteVoucher);

module.exports = router;
