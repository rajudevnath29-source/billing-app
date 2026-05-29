export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const getRole = () => {
  return getUser()?.role;
};

export const getPermissions = () => {
  return getUser()?.permissions || [];
};

// ==========================
// SUPER ADMIN
// ==========================
export const isSuperAdmin = () => {
  return getRole() === "SUPER_ADMIN";
};
