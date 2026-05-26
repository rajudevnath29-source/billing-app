const Payment =
  require("../models/Payment");

const Invoice =
  require("../models/Invoice");

// ====================================
// CREATE PAYMENT
// ====================================

const createPayment =
  async (req, res) => {

    try {

      const {

        customer,

        invoice,

        amount,

        note

      } = req.body;

      // FIND INVOICE

      const invoiceData =
        await Invoice.findById(
          invoice
        );

      if (!invoiceData) {

        return res.status(404)
          .json({

            message:
              "Invoice not found"

          });

      }

      // CREATE PAYMENT

      const payment =
        await Payment.create({

          customer,

          invoice,

          amount,

          note,

          created_by:
            req.user.id

        });

      // UPDATE INVOICE

      invoiceData.paid_amount +=
        Number(amount);

      invoiceData.due_amount -=
        Number(amount);

      // PAYMENT STATUS

      if (
        invoiceData.due_amount <= 0
      ) {

        invoiceData.payment_status =
          "PAID";

        invoiceData.due_amount = 0;

      }

      else {

        invoiceData.payment_status =
          "PARTIAL";

      }

      await invoiceData.save();

      res.status(201).json({

        message:
          "Payment collected",

        payment

      });

    } catch (error) {

      res.status(500).json({

        message:
          "Server error",

        error:
          error.message

      });

    }

  };

// ====================================
// GET PAYMENTS
// ====================================

const getPayments =
  async (req, res) => {

    try {

      const payments =
        await Payment.find()

          .populate("customer")
          .populate("invoice")

          .sort({
            createdAt: -1
          });

      res.json({
        payments
      });

    } catch (error) {

      res.status(500).json({

        message:
          "Error fetching payments",

        error:
          error.message

      });

    }

  };

module.exports = {

  createPayment,

  getPayments

};