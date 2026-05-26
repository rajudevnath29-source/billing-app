const mongoose = require("mongoose");

// PURCHASE ITEM SCHEMA
const purchaseItemSchema = new mongoose.Schema({

  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item"
  },

  item_name: String,

  qty: Number,

  purchase_price: Number,

  total: Number

});

// MAIN PURCHASE SCHEMA
const purchaseSchema = new mongoose.Schema({

  purchase_number: {
    type: String,
    unique: true
  },

  supplier_name: {
    type: String,
    required: true
  },

  supplier_mobile: {
    type: String
  },

  items: [purchaseItemSchema],

  sub_total: Number,

  discount: {
    type: Number,
    default: 0
  },

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

}, {
  timestamps: true
});

module.exports =
  mongoose.model("Purchase", purchaseSchema);