const mongoose =
  require("mongoose");

const paymentSchema =
  new mongoose.Schema(

    {

      customer: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Customer"

      },

      invoice: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Invoice"

      },

      amount: {

        type: Number,

        required: true

      },

      note: String,

      created_by: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User"

      }

    },

    {
      timestamps: true
    }

  );

module.exports =
  mongoose.model(
    "Payment",
    paymentSchema
  );