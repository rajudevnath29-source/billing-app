import { Link, useNavigate } from "react-router-dom";
import { isAdmin, isItemManager, isInvoiceUser, getUser } from "../utils/role";

export default function Sidebar({
  collapsed,
  setCollapsed,
  hovered,
  setHovered,
}) {
  const navigate = useNavigate();
  const user = getUser();
  const expanded = !collapsed || hovered;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.sidebar,
        width: expanded ? 260 : 80,
      }}
    >
      {/* LOGO + TOGGLE */}
      <h2>{expanded ? "🧾 ERP" : "🧾"}</h2>

      {/* USER */}
      <div style={styles.userBox}>
        <img
          src={
            user?.profile_image
              ? `http://localhost:5000/uploads/${user.profile_image}`
              : "https://i.pravatar.cc/80"
          }
          style={styles.image}
        />

        {!collapsed && (
          <>
            <p>{user?.name}</p>
            <small>{user?.role}</small>
          </>
        )}
      </div>

      {/* MENU */}
      <Link style={styles.link} to="/dashboard">
        📊 {!expanded ? "" : "Dashboard"}
      </Link>
      <Link style={styles.link} to="/profile">
        👤 {!expanded ? "" : "Profile"}
      </Link>

      {/* ADMIN MENU */}
      {isAdmin() && (
        <>
          {expanded && <p style={styles.section}>Reports</p>}
          <Link style={styles.link} style={styles.link} to="/reports">
            📊 {!expanded ? "" : "Reports"}
          </Link>

          {expanded && <p style={styles.section}>Accounts</p>}
          <Link style={styles.link} to="/expenses">
            💸 {!expanded ? "" : "Expenses"}
          </Link>
          <Link style={styles.link} to="/accounts">
            🏦 {!expanded ? "" : "Accounts"}
          </Link>
          <Link style={styles.link} to="/vouchers">
            💳 {!expanded ? "" : "Vouchers"}
          </Link>

          {expanded && <p style={styles.section}>Items Stock</p>}
          <Link style={styles.link} to="/stock-history">
            📊 {!expanded ? "" : "Stock History"}
          </Link>

          {expanded && <p style={styles.section}>Users</p>}
          <Link style={styles.link} to="/users">
            👥 {!expanded ? "" : "User Management"}
          </Link>
        </>
      )}

      {/* INVENTORY */}
      {(isAdmin() || isItemManager()) && (
        <>
          {expanded && <p style={styles.section}>Inventory</p>}
          <Link style={styles.link} to="/items">
            📦 {!expanded ? "" : "Items"}
          </Link>
          <Link style={styles.link} to="/items/add">
            ➕ {!expanded ? "" : "Add Item"}
          </Link>
          <Link style={styles.link} to="/purchase">
            🛒 {!expanded ? "" : "Purchase"}
          </Link>
          <Link style={styles.link} to="/purchase-view">
            📄 {!expanded ? "" : "Purchase History"}
          </Link>
        </>
      )}

      {/* INVOICE */}
      {(isAdmin() || isInvoiceUser()) && (
        <>
          {expanded && <p style={styles.section}>Invoices</p>}
          <Link style={styles.link} to="/invoice">
            ➕ {!expanded ? "" : "Create Invoice"}
          </Link>
          <Link style={styles.link} to="/invoice-view">
            📄 {!expanded ? "" : "Invoice List"}
          </Link>

          {expanded && <p style={styles.section}>Customers</p>}
          <Link style={styles.link} to="/customers">
            👥 {!expanded ? "" : "Customers"}
          </Link>
          <Link style={styles.link} to="/customer-ledger">
            📒 {!expanded ? "" : "Customer Ledger"}
          </Link>
          <Link style={styles.link} to="/payments">
            💰 {!expanded ? "" : "Payment Collection"}
          </Link>
        </>
      )}

      <button onClick={logout} style={styles.logout}>
        {!expanded ? "🚪" : "Logout"}
      </button>
    </div>
  );
}

const styles = {

  sidebar: {
    height: "100vh",
    background: "#1e293b",
    color: "#fff",
    padding: 10,
    position: "fixed",
    top: 0,
    left: 0,
    transition: "width 0.3s ease",
    overflow: "hidden",
  },

  userBox: {
    background: "#334155",
    padding: 15,
    borderRadius: 12,
    textAlign: "center",
    marginBottom: 20,
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: "50%",
  },

  section: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 12,
    opacity: 0.6,
    textTransform: "uppercase",
  },

  logout: {
    marginTop: 20,
    width: "100%",
    padding: 10,
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: 8,
  },
  link: {
    display: "block",
    padding: "10px 0",
    color: "#fff",
    textDecoration: "none",
  },
};
