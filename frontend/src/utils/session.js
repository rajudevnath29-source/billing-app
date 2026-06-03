export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const redirectToLogin = () => {
  clearAuthSession();

  if (window.location.pathname !== "/") {
    window.location.replace("/");
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payloadPart = token.split(".")[1];
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(paddedBase64));
    const expiresAt = payload.exp;

    if (!expiresAt) return false;

    return Date.now() >= expiresAt * 1000;
  } catch (error) {
    return true;
  }
};
