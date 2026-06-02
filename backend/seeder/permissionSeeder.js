const mongoose = require("mongoose");

const dotenv = require("dotenv");

const Permission = require("../models/Permission");
const PERMISSIONS = require("../constants/permissions");

dotenv.config();

// =========================
// PERMISSIONS
// =========================
const permission = (name, label, module) => ({ name, label, module });

const permissions = [
  // DASHBOARD
  permission(PERMISSIONS.DASHBOARD_ACCESS, "Dashboard Access", "DASHBOARD"),

  // ROLES / PERMISSIONS MANAGEMENT
  permission(PERMISSIONS.MANAGE_ROLES, "Manage Roles", "USERS"),
  permission(PERMISSIONS.MANAGE_PERMISSIONS, "Manage Permissions", "USERS"),
  permission(PERMISSIONS.MANAGE_USER_ACCESS, "Manage User Access", "USERS"),

  // ITEMS
  permission(PERMISSIONS.ITEMS_MODULE, "Items Module", "ITEMS"),
  permission(PERMISSIONS.VIEW_ITEMS, "View Items", "ITEMS"),
  permission(PERMISSIONS.ADD_ITEM, "Add Item", "ITEMS"),
  permission(PERMISSIONS.EDIT_ITEM, "Edit Item", "ITEMS"),
  permission(PERMISSIONS.DELETE_ITEM, "Delete Item", "ITEMS"),

  // PURCHASE
  permission(PERMISSIONS.PURCHASE_MODULE, "Purchase Module", "PURCHASE"),
  permission(PERMISSIONS.VIEW_PURCHASE, "View Purchase", "PURCHASE"),
  permission(PERMISSIONS.CREATE_PURCHASE, "Create Purchase", "PURCHASE"),
  permission(PERMISSIONS.EDIT_PURCHASE, "Edit Purchase", "PURCHASE"),
  permission(PERMISSIONS.DELETE_PURCHASE, "Delete Purchase", "PURCHASE"),
  permission(PERMISSIONS.PRINT_PURCHASE, "Print Purchase", "PURCHASE"),
  permission(
    PERMISSIONS.DOWNLOAD_PURCHASE_PDF,
    "Download Purchase PDF",
    "PURCHASE"
  ),

  // INVOICE
  permission(PERMISSIONS.INVOICE_MODULE, "Invoice Module", "INVOICE"),
  permission(PERMISSIONS.VIEW_INVOICE, "View Invoice", "INVOICE"),
  permission(PERMISSIONS.CREATE_INVOICE, "Create Invoice", "INVOICE"),
  permission(PERMISSIONS.EDIT_INVOICE, "Edit Invoice", "INVOICE"),
  permission(
    PERMISSIONS.CHNAGE_INVOICE_DATE,
    "Change Invoice Date",
    "INVOICE"
  ),
  permission(PERMISSIONS.DELETE_INVOICE, "Delete Invoice", "INVOICE"),
  permission(PERMISSIONS.PRINT_INVOICE, "Print Invoice", "INVOICE"),
  permission(
    PERMISSIONS.DOWNLOAD_INVOICE_PDF,
    "Download Invoice PDF",
    "INVOICE"
  ),

  // CUSTOMERS
  permission(PERMISSIONS.CUSTOMERS_MODULE, "Customers Module", "CUSTOMERS"),
  permission(PERMISSIONS.VIEW_CUSTOMERS, "View Customers", "CUSTOMERS"),
  permission(PERMISSIONS.ADD_CUSTOMER, "Add Customer", "CUSTOMERS"),
  permission(PERMISSIONS.EDIT_CUSTOMER, "Edit Customer", "CUSTOMERS"),
  permission(PERMISSIONS.DELETE_CUSTOMER, "Delete Customer", "CUSTOMERS"),

  // PAYMENTS
  permission(PERMISSIONS.PAYMENTS_MODULE, "Payments Module", "PAYMENTS"),
  permission(PERMISSIONS.VIEW_PAYMENTS, "View Payments", "PAYMENTS"),
  permission(PERMISSIONS.ADD_PAYMENT, "Add Payment", "PAYMENTS"),

  // REPORTS
  permission(PERMISSIONS.REPORTS_MODULE, "Reports Module", "REPORTS"),

  // EXPENSES
  permission(PERMISSIONS.EXPENSES_MODULE, "Expenses Module", "EXPENSES"),

  // ACCOUNTS
  permission(PERMISSIONS.ACCOUNTS_MODULE, "Accounts Module", "ACCOUNTS"),

  // VOUCHERS
  permission(PERMISSIONS.VOUCHERS_MODULE, "Vouchers Module", "VOUCHERS"),

  // STOCK
  permission(PERMISSIONS.STOCK_MODULE, "Stock Module", "STOCK"),

  // USERS
  permission(PERMISSIONS.USERS_MODULE, "Users Module", "USERS"),
  permission(PERMISSIONS.VIEW_USERS, "View Users", "USERS"),
  permission(PERMISSIONS.ADD_USER, "Add User", "USERS"),
  permission(PERMISSIONS.EDIT_USER, "Edit User", "USERS"),
  permission(PERMISSIONS.DELETE_USER, "Delete User", "USERS"),

  // LEDGER
  permission(PERMISSIONS.CUSTOMER_LEDGER, "Customer Ledger", "LEDGER"),
];

const syncPermissions = async () => {
  let inserted = 0;
  let updated = 0;

  // IMPORTANT:
  // We do NOT delete old permission docs here, because users may reference
  // those documents by _id. Deleting and recreating would break relations.
  for (const item of permissions) {
    const result = await Permission.updateOne(
      { name: item.name },
      { $set: item },
      { upsert: true }
    );

    if (result.upsertedCount > 0) inserted += 1;
    else if (result.modifiedCount > 0) updated += 1;
  }

  return { inserted, updated, total: permissions.length };
};

const seedPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const summary = await syncPermissions();
    console.log(
      `Permissions synced safely | inserted: ${summary.inserted}, updated: ${summary.updated}, total: ${summary.total}`
    );
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedPermissions();
}

module.exports = {
  permissions,
  syncPermissions,
};
