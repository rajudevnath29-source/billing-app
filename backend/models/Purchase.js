const mongoose = require("mongoose");

// PURCHASE ITEM SCHEMA
const purchaseItemSchema = new mongoose.Schema({
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },

  item_name: String,

  qty: Number,

  purchase_price: Number,

  total: Number,
  
  serial_numbers: {
    type: [String],
    default: [],
  },
});

// MAIN PURCHASE SCHEMA
const purchaseSchema = new mongoose.Schema(
  {
    purchase_number: {
      type: String,
      unique: true,
    },

    supplier_name: {
      type: String,
      required: true,
    },

    supplier_mobile: {
      type: String,
    },

    supplier_gstin: {
      type: String,
      default: "",
    },

    invoice_no: {
      type: String,
    },

    invoice_date: {
      type: Date,
      default: Date.now,
    },

    items: [purchaseItemSchema],

    sub_total: Number,

    gst_enabled: {
      type: Boolean,
      default: false,
    },

    gst_rate: {
      type: Number,
      default: 0,
    },

    gst_amount: {
      type: Number,
      default: 0,
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

    gst_type: {
      type: String,
      enum: ["INTRA", "INTER", "NONE"],
      default: "NONE",
    },

    place_of_supply: {
      type: String,
      default: "",
    },

    grand_total: Number,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Purchase", purchaseSchema);
