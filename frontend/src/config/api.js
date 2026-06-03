export const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export const API_URL = `${API_BASE_URL}/api`;

export const getUploadUrl = (filename) => {
  if (!filename) return "";

  return `${API_BASE_URL}/uploads/${filename}`;
};
