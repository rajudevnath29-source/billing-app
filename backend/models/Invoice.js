const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item"
  },
  item_name: String,
  qty: Number,
  price: Number,
  total: Number
});

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      unique: true
    },

    customer_name: String,
    customer_mobile: String,

    items: [invoiceItemSchema],

    sub_total: Number,

    discount: {
      type: Number,
      default: 0
    },

    // 🔥 NEW FIELD (MAIN FEATURE)
    gst_enabled: {
      type: Boolean,
      default: false
    },

    gst_rate: {
      type: Number,
      default: 0
    },

    gst_amount: {
      type: Number,
      default: 0
    },

    grand_total: Number,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);