const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(

  {

    title: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    note: {
      type: String
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }

  },

  {
    timestamps: true
  }

);

module.exports =
  mongoose.model(
    "Expense",
    expenseSchema
  );