const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");


const {
  createInvoice, getInvoices, getInvoiceById, getInvoicesByCustomer, updateInvoice, deleteInvoice} = require("../controllers/invoiceController");

// CREATE INVOICE
router.post( "/", authMiddleware, permissionMiddleware("CREATE_INVOICE"), createInvoice);

// GET ALL INVOICES
router.get("/", authMiddleware, permissionMiddleware("VIEW_INVOICE"),  getInvoices);

router.get("/customer/:customerId", authMiddleware, permissionMiddleware("VIEW_INVOICE"), getInvoicesByCustomer);

// GET SINGLE INVOICE
router.get("/:id", authMiddleware, permissionMiddleware("VIEW_INVOICE"), getInvoiceById);

//Edit INVOICE
router.put("/:id", authMiddleware, permissionMiddleware("EDIT_INVOICE"), updateInvoice);

//Delete INVOICE
router.delete("/:id", authMiddleware, permissionMiddleware("DELETE_INVOICE"), deleteInvoice);

module.exports = router;
