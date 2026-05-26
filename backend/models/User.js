const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ITEM_MANAGER", "INVOICE_USER"],
      default: "INVOICE_USER"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);