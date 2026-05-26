const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {

  createVoucher,

  getVouchers

} = require(
  "../controllers/voucherController"
);

// CREATE
router.post(

  "/",

  authMiddleware,

  createVoucher

);

// GET
router.get(

  "/",

  authMiddleware,

  getVouchers

);

module.exports = router;