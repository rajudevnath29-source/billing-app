const mongoose = require("mongoose");

const dotenv = require("dotenv");

const Role = require("../models/Role");
const Permission = require("../models/Permission");
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
      PERMISSIONS.DASHBOARD_ACCESS,
      PERMISSIONS.PROFILE_ACCESS,

      PERMISSIONS.ITEMS_MODULE,
      PERMISSIONS.VIEW_ITEMS,

      PERMISSIONS.PURCHASE_MODULE,
      PERMISSIONS.VIEW_PURCHASE,
    ],
  },

  {
    name: "INVOICE_USER",

    permissions: [
      PERMISSIONS.DASHBOARD_ACCESS,
      PERMISSIONS.PROFILE_ACCESS,
      
      PERMISSIONS.INVOICE_MODULE,
      PERMISSIONS.VIEW_INVOICE,

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
  const permissionDocs = await Permission.find({
    name: { $in: Object.values(PERMISSIONS) },
  }).select("_id name");
  const permissionIdByName = new Map(
    permissionDocs.map((permission) => [
      permission.name,
      permission._id,
    ]),
  );

  // IMPORTANT:
  // We do NOT delete old role docs here, because users may reference
  // those roles by _id. Deleting and recreating would break relations.
  for (const item of roles) {
    const permissions =
      item.permissions[0] === "ALL"
        ? []
        : item.permissions
            .map((name) => permissionIdByName.get(name))
            .filter(Boolean);

    const result = await Role.updateOne(
      { name: item.name },
      { $set: { name: item.name, permissions } },
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
