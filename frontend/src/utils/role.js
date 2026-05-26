export const getRole = () => {
  return localStorage.getItem("role");
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