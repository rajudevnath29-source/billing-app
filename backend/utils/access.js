const isRolePermission = (permissionName = "") => {
  return (
    permissionName.endsWith("_MODULE") ||
    permissionName.startsWith("VIEW_") ||
    permissionName === "DASHBOARD_ACCESS" ||
    permissionName === "CUSTOMER_LEDGER"
  );
};

const normalizeDirectPermissions = (permissions = []) => {
  return permissions
    .map((permission) =>
      typeof permission === "string" ? permission : permission?.name,
    )
    .filter(Boolean);
};

const getEffectivePermissionNames = (user) => {
  if (!user) return [];
  if (user.role === "SUPER_ADMIN") return ["ALL"];

  return [...new Set(normalizeDirectPermissions(user.permissions))];
};

const buildPermissionPayload = (permissionNames = []) => {
  return permissionNames.map((name) => ({ name }));
};

module.exports = {
  buildPermissionPayload,
  getEffectivePermissionNames,
  isRolePermission,
};
