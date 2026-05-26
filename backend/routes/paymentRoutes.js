const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {

  createPayment,

  getPayments

} = require(
  "../controllers/paymentController"
);

// CREATE
router.post(

  "/",

  authMiddleware,

  createPayment

);

// GET
router.get(

  "/",

  authMiddleware,

  getPayments

);

module.exports = router;