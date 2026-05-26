import { Navigate } from "react-router-dom";
import { getRole } from "../utils/role";

export default function RoleGuard({ allowedRoles, children }) {
  const role = getRole();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}