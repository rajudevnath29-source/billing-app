const mongoose = require("mongoose");

const gstLedgerSchema = new mongoose.Schema(
  {
    transaction_type: {
      type: String,
      enum: ["INPUT", "OUTPUT"],
      required: true,
    },

    transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    transaction_number: {
      type: String,
      required: true,
    },

    transaction_date: {
      type: Date,
      required: true,
    },

    party_name: {
      type: String,
      required: true,
    },

    party_gstin: {
      type: String,
      default: "",
    },

    taxable_amount: {
      type: Number,
      required: true,
    },

    cgst_amount: {
      type: Number,
      default: 0,
    },

    sgst_amount: {
      type: Number,
      default: 0,
    },

    igst_amount: {
      type: Number,
      default: 0,
    },

    total_gst: {
      type: Number,
      required: true,
    },

    gst_rate: {
      type: Number,
      required: true,
    },

    gst_type: {
      type: String,
      enum: ["INTRA", "INTER", "NONE"],
      default: "NONE",
    },

    place_of_supply: {
      type: String,
      default: "",
    },

    month: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("GstLedger", gstLedgerSchema);
