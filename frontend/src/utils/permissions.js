// import { getUser } from "./role";

// // DEFAULT ROLE PERMISSIONS
// const rolePermissions = {
//   ITEM_MANAGER: [
//     // MODULES
//     "ITEMS_MODULE",

//     // ITEMS
//     "VIEW_ITEMS",
//     "ADD_ITEM",
//     "EDIT_ITEM",

//     // PURCHASE
//     "VIEW_PURCHASE",
//     "CREATE_PURCHASE",
//   ],

//   INVOICE_USER: [
//     // MODULES
//     "INVOICE_MODULE",
//     "CUSTOMER_MODULE",

//     // INVOICE
//     "CREATE_INVOICE",
//     "VIEW_INVOICE",
//     "EDIT_INVOICE",

//     // CUSTOMERS
//     "VIEW_CUSTOMERS",
//     "ADD_CUSTOMER",

//     // PAYMENTS
//     "VIEW_PAYMENTS",
//   ],

//   ADMIN: [
//     "REPORTS_MODULE",
//     "VIEW_REPORTS",

//     "ACCOUNTS_MODULE",
//     "VIEW_ACCOUNTS",

//     "USERS_MODULE",
//     "VIEW_USERS",
//   ],
// };

// export const hasPermission = (permission) => {
//   const user = getUser();

//   if (!user) return false;

//   // SUPER ADMIN => EVERYTHING
//   if (user.role === "SUPER_ADMIN") {
//     return true;
//   }

//   // ROLE DEFAULT PERMISSIONS
//   const defaultPermissions =
//     rolePermissions[user.role] || [];

//   // CUSTOM USER PERMISSIONS
//   const customPermissions =
//     user.permissions || [];

//   // MERGE BOTH
//   const allPermissions = [
//     ...defaultPermissions,
//     ...customPermissions,
//   ];

//   return allPermissions.includes(permission);
// };

import { getUser } from "./role";

export const hasPermission = (permission) => {
  const user = getUser();

  // NOT LOGGED IN
  if (!user) {
    return false;
  }

  // SUPER ADMIN
  if (user.role === "SUPER_ADMIN") {
    return true;
  }

  // USER PERMISSIONS
  const permissions = user.permissions || [];

  return permissions.includes(permission);
};
