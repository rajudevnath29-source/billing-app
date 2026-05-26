const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createInvoice, getInvoices, getInvoiceById, getInvoicesByCustomer, updateInvoice} = require("../controllers/invoiceController");

// CREATE INVOICE
router.post( "/",  authMiddleware,  roleMiddleware(["SUPER_ADMIN", "INVOICE_USER"]),  createInvoice,);

// GET ALL INVOICES
router.get("/", authMiddleware, getInvoices);

// GET SINGLE INVOICE
router.get("/:id", authMiddleware, getInvoiceById);

router.get("/customer/:customerId", authMiddleware, getInvoicesByCustomer);

router.put("/:id", authMiddleware, updateInvoice);

module.exports = router;
