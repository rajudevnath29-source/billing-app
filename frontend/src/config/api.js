export const API_BASE_URL = 'https://billing-app-lwkd.onrender.com' //'http://localhost:5000';
export const API_URL = `${API_BASE_URL}/api`;

export const getUploadUrl = (filename) => {
  if (!filename) return "";

  return `${API_BASE_URL}/uploads/${filename}`;
};
