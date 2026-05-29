const mongoose = require("mongoose");

const dotenv = require("dotenv");

const Role = require("../models/Role");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const roles = [
  {
    name: "SUPER_ADMIN",

    permissions: ["ALL"],
  },

  {
    name: "ITEM_MANAGER",

    permissions: [
      "ITEMS_MODULE",
      "VIEW_ITEMS",
      "ADD_ITEM",
      "EDIT_ITEM",
      "DELETE_ITEM",

      "VIEW_PURCHASE",
      "CREATE_PURCHASE",
      "EDIT_PURCHASE",
    ],
  },

  {
    name: "INVOICE_USER",

    permissions: [
      "INVOICE_MODULE",
      "VIEW_INVOICE",
      "CREATE_INVOICE",

      "CUSTOMERS_MODULE",
      "VIEW_CUSTOMERS",

      "PAYMENTS_MODULE",
      "VIEW_PAYMENTS",
    ],
  },
];

const seedRoles = async () => {
  try {
    await Role.deleteMany();

    await Role.insertMany(roles);

    console.log("Roles Seeded");

    process.exit();
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

seedRoles();
