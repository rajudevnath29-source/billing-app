const mongoose = require("mongoose");

const dotenv = require("dotenv");

const Role = require("../models/Role");
const PERMISSIONS = require("../constants/permissions");

dotenv.config();

const roles = [
  {
    name: "SUPER_ADMIN",

    permissions: ["ALL"],
  },

  {
    name: "ITEM_MANAGER",

    permissions: [
      PERMISSIONS.ITEMS_MODULE,
      PERMISSIONS.VIEW_ITEMS,
      PERMISSIONS.ADD_ITEM,
      PERMISSIONS.EDIT_ITEM,
      PERMISSIONS.DELETE_ITEM,

      PERMISSIONS.VIEW_PURCHASE,
      PERMISSIONS.CREATE_PURCHASE,
      PERMISSIONS.EDIT_PURCHASE,
    ],
  },

  {
    name: "INVOICE_USER",

    permissions: [
      PERMISSIONS.INVOICE_MODULE,
      PERMISSIONS.VIEW_INVOICE,
      PERMISSIONS.CREATE_INVOICE,

      PERMISSIONS.CUSTOMERS_MODULE,
      PERMISSIONS.VIEW_CUSTOMERS,

      PERMISSIONS.PAYMENTS_MODULE,
      PERMISSIONS.VIEW_PAYMENTS,
    ],
  },
];

const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const summary = await syncRoles();
    console.log(
      `Roles synced safely | inserted: ${summary.inserted}, updated: ${summary.updated}, total: ${summary.total}`
    );
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const syncRoles = async () => {
  let inserted = 0;
  let updated = 0;

  // IMPORTANT:
  // We do NOT delete old role docs here, because users may reference
  // those roles by _id. Deleting and recreating would break relations.
  for (const item of roles) {
    const result = await Role.updateOne(
      { name: item.name },
      { $set: item },
      { upsert: true }
    );

    if (result.upsertedCount > 0) inserted += 1;
    else if (result.modifiedCount > 0) updated += 1;
  }

  return { inserted, updated, total: roles.length };
};

if (require.main === module) {
  seedRoles();
}

module.exports = {
  roles,
  syncRoles,
};
