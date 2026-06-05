// export const API_BASE_URL = 'https://billing-app-lwkd.onrender.com' //'http://localhost:5000';
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocalhost
  ? "http://localhost:5000"
  : "https://billing-app-lwkd.onrender.com";
export const API_URL = `${API_BASE_URL}/api`;

export const getUploadUrl = (filename) => {
  if (!filename) return "";

  return `${API_BASE_URL}/uploads/${filename}`;
};
