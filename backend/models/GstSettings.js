const mongoose = require("mongoose");

const gstSettingsSchema = new mongoose.Schema(
  {
    business_name: {
      type: String,
      default: "",
    },

    gstin: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    state_code: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    bank_name: {
      type: String,
      default: "",
    },

    account_number: {
      type: String,
      default: "",
    },

    ifsc_code: {
      type: String,
      default: "",
    },

    pan_number: {
      type: String,
      default: "",
    },

    invoice_prefix: {
      type: String,
      default: "INV",
    },

    terms_and_conditions: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("GstSettings", gstSettingsSchema);
