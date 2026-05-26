const mongoose =
  require("mongoose");

const accountSchema =
  new mongoose.Schema(

    {

      account_name: {

        type: String,

        required: true

      },

      account_type: {

        type: String,

        enum: [
          "CASH",
          "BANK"
        ],

        required: true

      },

      balance: {

        type: Number,

        default: 0

      },

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
    "Account",
    accountSchema
  );