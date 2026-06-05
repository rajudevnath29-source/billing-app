const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  createVoucher,
  getVouchers,
  deleteVoucher,
} = require("../controllers/voucherController");

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("CREATE_VOUCHER"),
  createVoucher,
);

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("VIEW_VOUCHER"),
  getVouchers,
);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("DELETE_VOUCHER"),
  deleteVoucher,
);

module.exports = router;
