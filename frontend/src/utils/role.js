export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const getRole = () => {
  return getUser()?.role;
};

export const getPermissions = () => {
  console.log(getUser());
  return (getUser()?.permissions || []).map(
    (permission) => permission.name,
  );
};

// ==========================
// SUPER ADMIN
// ==========================
export const isSuperAdmin = () => {
  return getRole() === "SUPER_ADMIN";
};