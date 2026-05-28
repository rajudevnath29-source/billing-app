export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const getRole = () => {
  return getUser()?.role;
};

// export const getToken = () => {
//   return localStorage.getItem("token");
// };
