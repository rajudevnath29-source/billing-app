const Payment = require("../models/Payment");

const Invoice = require("../models/Invoice");

// ====================================
// CREATE PAYMENT
// ====================================

const createPayment = async (req, res) => {
  try {
    const {
      customer,

      invoice,

      amount,

      note,
    } = req.body;

    // FIND INVOICE

    const invoiceData = await Invoice.findById(invoice);

    if (!invoiceData) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // CREATE PAYMENT

    const payment = await Payment.create({
      customer,

      invoice,

      amount,

      note,

      created_by: req.user.id,
    });

    // UPDATE INVOICE

    invoiceData.paid_amount += Number(amount);

    invoiceData.due_amount -= Number(amount);

    // PAYMENT STATUS

    if (invoiceData.due_amount <= 0) {
      invoiceData.payment_status = "PAID";

      invoiceData.due_amount = 0;
    } else {
      invoiceData.payment_status = "PARTIAL";
    }

    await invoiceData.save();

    res.status(201).json({
      message: "Payment collected",

      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",

      error: error.message,
    });
  }
};

// ====================================
// GET PAYMENTS
// ====================================

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()

      .populate("customer")
      .populate("invoice")

      .sort({
        createdAt: -1,
      });

    res.json({
      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payments",

      error: error.message,
    });
  }
};
// ====================================
// DELETE PAYMENT
// ====================================

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const invoice = await Invoice.findById(payment.invoice);

    if (invoice) {
      // Rollback payment

      invoice.paid_amount -= Number(payment.amount);

      invoice.due_amount += Number(payment.amount);

      // Status reset

      if (invoice.paid_amount <= 0) {
        invoice.payment_status = "DUE";
      } else {
        invoice.payment_status = "PARTIAL";
      }

      await invoice.save();
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.json({
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  deletePayment,
};
