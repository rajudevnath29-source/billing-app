const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    voucher_type: {
      type: String,

      enum: ["CREDIT", "DEBIT", "TRANSFER"],

      required: true,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Account",

      required: true,
    },

    to_account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },

    amount: {
      type: Number,

      required: true,
    },

    note: String,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Voucher", voucherSchema);
