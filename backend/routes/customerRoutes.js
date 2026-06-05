const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  createCustomer,
  getCustomers,
  getCustomersWithSales,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("ADD_CUSTOMER"),
  createCustomer,
);

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("VIEW_CUSTOMER"),
  getCustomers,
);
router.get(
  "/with-sales",
  authMiddleware,
  permissionMiddleware("VIEW_CUSTOMER"),
  getCustomersWithSales,
);

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("VIEW_CUSTOMER"),
  getCustomerById,
);

router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("EDIT_CUSTOMER"),
  updateCustomer,
);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("DELETE_CUSTOMER"),
  deleteCustomer,
);

module.exports = router;
