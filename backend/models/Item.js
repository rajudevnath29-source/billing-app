const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    item_name: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      required: true,
    },

    sales_price: {
      type: Number,
      required: true,
    },

    purchase_price: {
      type: Number,
      required: true,
    },

    opening_stock: {
      type: Number,
      default: 0,
    },

    low_stock_alert: {
      type: Number,
      default: 0,
    },

    image: {
      type: String, // (URL or file path later)
    },

    hsn_code: {
      type: String,
      default: "",
    },

    gst_rate: {
      type: Number,
      default: 18,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Item", itemSchema);
