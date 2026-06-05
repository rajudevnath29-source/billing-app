const mongoose = require("mongoose");

const dotenv = require("dotenv");

const Permission = require("../models/Permission");
const PERMISSIONS = require("../constants/permissions");

dotenv.config();

// =========================
// PERMISSIONS
// =========================
const permission = (name, label, module) => ({ name, label, module });

const PERMISSION_RENAMES = {
  ITEMS_MODULE: "ITEM_MODULE",
  VIEW_ITEMS: "VIEW_ITEM",
  CUSTOMERS_MODULE: "CUSTOMER_MODULE",
  VIEW_CUSTOMERS: "VIEW_CUSTOMER",
  PAYMENTS_MODULE: "PAYMENT_MODULE",
  VIEW_PAYMENTS: "VIEW_PAYMENT",
  REPORTS_MODULE: "REPORT_MODULE",
  VIEW_REPORTS: "VIEW_REPORT",
  EXPENSES_MODULE: "EXPENSE_MODULE",
  CREATE_EXPENSES: "CREATE_EXPENSE",
  ACCOUNTS_MODULE: "ACCOUNT_MODULE",
  CREATE_ACCOUNTS: "CREATE_ACCOUNT",
  VOUCHERS_MODULE: "VOUCHER_MODULE",
  CREATE_VOUCHERS: "CREATE_VOUCHER",
  USERS_MODULE: "USER_MODULE",
  VIEW_USERS: "VIEW_USER",
};

const migratePermissionNames = async () => {
  for (const [oldName, newName] of Object.entries(PERMISSION_RENAMES)) {
    await Permission.updateOne({ name: oldName }, { $set: { name: newName } });
  }
};

const permissions = [
  // DASHBOARD
  permission(PERMISSIONS.DASHBOARD_ACCESS, "Dashboard Access", "DASHBOARD"),

   // Profile
  permission(PERMISSIONS.PROFILE_ACCESS, "Profile Access", "PROFILE"),

  // ROLES / PERMISSIONS MANAGEMENT
  permission(PERMISSIONS.MANAGE_ROLES, "Manage Roles", "USER"),
  permission(PERMISSIONS.MANAGE_PERMISSIONS, "Manage Permissions", "USER"),
  permission(PERMISSIONS.MANAGE_USER_ACCESS, "Manage User Access", "USER"),

  // ITEM
  permission(PERMISSIONS.ITEM_MODULE, "Item Module", "ITEM"),
  permission(PERMISSIONS.VIEW_ITEM, "View Item", "ITEM"),
  permission(PERMISSIONS.ADD_ITEM, "Add Item", "ITEM"),
  permission(PERMISSIONS.EDIT_ITEM, "Edit Item", "ITEM"),
  permission(PERMISSIONS.DELETE_ITEM, "Delete Item", "ITEM"),

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
  permission(PERMISSIONS.BULK_INVOICE, "Bulk Invoice", "INVOICE"),
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

  // CUSTOMER
  permission(PERMISSIONS.CUSTOMER_MODULE, "Customer Module", "CUSTOMER"),
  permission(PERMISSIONS.VIEW_CUSTOMER, "View Customer", "CUSTOMER"),
  permission(PERMISSIONS.ADD_CUSTOMER, "Add Customer", "CUSTOMER"),
  permission(PERMISSIONS.EDIT_CUSTOMER, "Edit Customer", "CUSTOMER"),
  permission(PERMISSIONS.DELETE_CUSTOMER, "Delete Customer", "CUSTOMER"),
  permission(PERMISSIONS.CUSTOMER_LEDGER, "Customer Ledger", "LEDGER"),

  // PAYMENT
  permission(PERMISSIONS.PAYMENT_MODULE, "Payment Module", "PAYMENT"),
  permission(PERMISSIONS.VIEW_PAYMENT, "View Payment", "PAYMENT"),
  permission(PERMISSIONS.ADD_PAYMENT, "Add Payment", "PAYMENT"),
  permission(PERMISSIONS.DELETE_PAYMENT, "Delete Payment", "PAYMENT"),

  // REPORT
  permission(PERMISSIONS.REPORT_MODULE, "Report Module", "REPORT"),
  permission(PERMISSIONS.VIEW_REPORT, "View Report", "REPORT"),
  permission(PERMISSIONS.EXPORT_REPORT, "Export Report", "REPORT"),

  // EXPENSE
  permission(PERMISSIONS.EXPENSE_MODULE, "Expense Module", "EXPENSE"),
  permission(PERMISSIONS.VIEW_EXPENSE, "View Expense", "EXPENSE"),
  permission(PERMISSIONS.CREATE_EXPENSE, "Create Expense", "EXPENSE"),
  permission(PERMISSIONS.DELETE_EXPENSE, "Delete Expense", "EXPENSE"),

  // ACCOUNT
  permission(PERMISSIONS.ACCOUNT_MODULE, "Account Module", "ACCOUNT"),
  permission(PERMISSIONS.VIEW_ACCOUNT, "View Account", "ACCOUNT"),
  permission(PERMISSIONS.CREATE_ACCOUNT, "Create Account", "ACCOUNT"),
  permission(PERMISSIONS.DELETE_ACCOUNT, "Delete Account", "ACCOUNT"),

  // VOUCHER
  permission(PERMISSIONS.VOUCHER_MODULE, "Voucher Module", "VOUCHER"),
  permission(PERMISSIONS.VIEW_VOUCHER, "View Voucher", "VOUCHER"),
  permission(PERMISSIONS.CREATE_VOUCHER, "Create Voucher", "VOUCHER"),
  permission(PERMISSIONS.DELETE_VOUCHER, "Delete Voucher", "VOUCHER"),

  // STOCK
  permission(PERMISSIONS.STOCK_MODULE, "Stock Module", "STOCK"),
  permission(PERMISSIONS.VIEW_STOCK, "View Stock", "STOCK"),

  // USER
  permission(PERMISSIONS.USER_MODULE, "User Module", "USER"),
  permission(PERMISSIONS.VIEW_USER, "View User", "USER"),
  permission(PERMISSIONS.ADD_USER, "Add User", "USER"),
  permission(PERMISSIONS.EDIT_USER, "Edit User", "USER"),
  permission(PERMISSIONS.DELETE_USER, "Delete User", "USER"),

 
];

const syncPermissions = async () => {
  let inserted = 0;
  let updated = 0;

  // await migratePermissionNames();

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
