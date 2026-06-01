const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createCustomer,
  getCustomers,
  getCustomersWithSales,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

// CREATE
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN", "INVOICE_USER"]),
  createCustomer,
);

// GET ALL
router.get("/", authMiddleware, getCustomers);
router.get("/with-sales", authMiddleware, getCustomersWithSales);

// GET SINGLE
router.get("/:id", authMiddleware, getCustomerById);

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN", "INVOICE_USER"]),
  updateCustomer,
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  deleteCustomer,
);

module.exports = router;
