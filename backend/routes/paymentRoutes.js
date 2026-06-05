const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  createPayment,
  getPayments,
  deletePayment,
} = require("../controllers/paymentController");

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("ADD_PAYMENT"),
  createPayment,
);

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("VIEW_PAYMENT"),
  getPayments,
);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("DELETE_PAYMENT"),
  deletePayment,
);

module.exports = router;
