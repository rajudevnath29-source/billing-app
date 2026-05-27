export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const getRole = () => {
  return getUser()?.role;
};

export const isAdmin = () => {
  return getRole() === "SUPER_ADMIN";
};

export const isItemManager = () => {
  return getRole() === "ITEM_MANAGER";
};

export const isInvoiceUser = () => {
  return getRole() === "INVOICE_USER";
};