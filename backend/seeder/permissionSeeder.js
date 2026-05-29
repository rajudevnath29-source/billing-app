const mongoose = require("mongoose");

const dotenv = require("dotenv");

const Permission = require("../models/Permission");

dotenv.config();

// =========================
// DB CONNECT
// =========================
mongoose.connect(process.env.MONGO_URI);

// =========================
// PERMISSIONS
// =========================
const permissions = [
  // USERS
  {
    name: "VIEW_USERS",
    label: "View Users",
    module: "USERS",
  },

  {
    name: "EDIT_USER",
    label: "Edit User",
    module: "USERS",
  },

  {
    name: "DELETE_USER",
    label: "Delete User",
    module: "USERS",
  },

  {
    name: "MANAGE_PERMISSIONS",
    label: "Manage Permissions",
    module: "USERS",
  },

  // ITEMS
  {
    name: "ITEMS_MODULE",
    label: "Items Module",
    module: "ITEMS",
  },

  {
    name: "VIEW_ITEMS",
    label: "View Items",
    module: "ITEMS",
  },

  {
    name: "ADD_ITEM",
    label: "Add Item",
    module: "ITEMS",
  },

  {
    name: "EDIT_ITEM",
    label: "Edit Item",
    module: "ITEMS",
  },

  {
    name: "DELETE_ITEM",
    label: "Delete Item",
    module: "ITEMS",
  },

  // PURCHASE
  {
    name: "VIEW_PURCHASE",
    label: "View Purchase",
    module: "PURCHASE",
  },

  {
    name: "CREATE_PURCHASE",
    label: "Create Purchase",
    module: "PURCHASE",
  },

  {
    name: "EDIT_PURCHASE",
    label: "Edit Purchase",
    module: "PURCHASE",
  },

  {
    name: "DELETE_PURCHASE",
    label: "Delete Purchase",
    module: "PURCHASE",
  },

  // INVOICE
  {
    name: "INVOICE_MODULE",
    label: "Invoice Module",
    module: "INVOICE",
  },

  {
    name: "VIEW_INVOICE",
    label: "View Invoice",
    module: "INVOICE",
  },

  {
    name: "CREATE_INVOICE",
    label: "Create Invoice",
    module: "INVOICE",
  },

  {
    name: "EDIT_INVOICE",
    label: "Edit Invoice",
    module: "INVOICE",
  },

  {
    name: "DELETE_INVOICE",
    label: "Delete Invoice",
    module: "INVOICE",
  },

  // CUSTOMERS
  {
    name: "CUSTOMERS_MODULE",
    label: "Customers Module",
    module: "CUSTOMERS",
  },

  {
    name: "VIEW_CUSTOMERS",
    label: "View Customers",
    module: "CUSTOMERS",
  },

  {
    name: "ADD_CUSTOMER",
    label: "Add Customer",
    module: "CUSTOMERS",
  },

  {
    name: "EDIT_CUSTOMER",
    label: "Edit Customer",
    module: "CUSTOMERS",
  },

  {
    name: "DELETE_CUSTOMER",
    label: "Delete Customer",
    module: "CUSTOMERS",
  },

  // PAYMENTS
  {
    name: "PAYMENTS_MODULE",
    label: "Payments Module",
    module: "PAYMENTS",
  },

  {
    name: "VIEW_PAYMENTS",
    label: "View Payments",
    module: "PAYMENTS",
  },

  {
    name: "ADD_PAYMENT",
    label: "Add Payment",
    module: "PAYMENTS",
  },

  // REPORTS
  {
    name: "REPORTS_MODULE",
    label: "Reports Module",
    module: "REPORTS",
  },
];

// =========================
// INSERT
// =========================
const seedPermissions = async () => {
  try {
    await Permission.deleteMany();

    await Permission.insertMany(permissions);

    console.log("Permissions Seeded");

    process.exit();
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

seedPermissions();
