import { Navigate } from "react-router-dom";
import { clearAuthSession, isTokenExpired } from "../utils/session";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    clearAuthSession();
    return <Navigate to="/" />;
  }

  return children;
}
