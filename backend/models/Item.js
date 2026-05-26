const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    item_name: {
      type: String,
      required: true,
      trim: true
    },

    unit: {
      type: String,
      required: true
    },

    sales_price: {
      type: Number,
      required: true
    },

    purchase_price: {
      type: Number,
      required: true
    },

    opening_stock: {
      type: Number,
      default: 0
    },

    as_of_date: {
      type: Date,
      default: Date.now
    },

    low_stock_alert: {
      type: Number,
      default: 0
    },

    image: {
      type: String // (URL or file path later)
    },

    created_at: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: false }
);

module.exports = mongoose.model("Item", itemSchema);