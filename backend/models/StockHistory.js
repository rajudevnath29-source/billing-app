const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    type: {
      type: String,
      enum: ["PURCHASE", "SALE", "RETURN", "ADJUSTMENT"],
      required: true,
    },

    qty: {
      type: Number,
      required: true,
    },

    previous_stock: {
      type: Number,
      required: true,
    },

    new_stock: {
      type: Number,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    reference_id: {
      type: String,
      default: "",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockHistory", stockHistorySchema);