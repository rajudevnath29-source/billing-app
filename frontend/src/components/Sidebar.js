import { Link, useNavigate } from "react-router-dom";
import { isAdmin, isItemManager, isInvoiceUser, getUser } from "../utils/role";

export default function Sidebar() {
  const navigate = useNavigate();

  const user = getUser();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div style={styles.sidebar}>
      {/* USER BLOCK */}
      <div style={styles.userBox}>
        <img
          src={
            user?.profile_image
              ? `http://localhost:5000/uploads/${user.profile_image}`
              : "https://i.pravatar.cc/100"
          }
          alt="profile"
          style={styles.image}
        />

        <h3>{user?.name}</h3>

        <p>{user?.email}</p>

        <small>{user?.role}</small>
      </div>

      <h2 style={styles.logo}>🧾 ERP</h2>

      <Link style={styles.link} to="/dashboard">
        📊 Dashboard
      </Link>

      <Link style={styles.link} to="/profile">
        👤 My Profile
      </Link>

      {/* ADMIN ONLY */}
      {isAdmin() && (
        <>
          <p style={styles.section}>Reports</p>
          <Link style={styles.link} to="/reports">
            📊 Reports
          </Link>

          <p style={styles.section}>Accounts</p>
          <Link style={styles.link} to="/expenses">
            💸 Expenses
          </Link>

          <Link style={styles.link} to="/accounts">
            🏦 Bank Accounts
          </Link>
          <Link style={styles.link} to="/vouchers">
            💳 Vouchers
          </Link>

          <p style={styles.section}>Items Stock</p>
          <Link style={styles.link} to="/stock-history">
            📊 Stock History
          </Link>

          <p style={styles.section}>Users</p>
          <Link style={styles.link} to="/users">
            👥 User Management
          </Link>
        </>
      )}

      {/* ITEM MANAGER + ADMIN */}
      {(isAdmin() || isItemManager()) && (
        <>
          <p style={styles.section}>Inventory</p>

          <Link style={styles.link} to="/items">
            📦 View Items
          </Link>

          <Link style={styles.link} to="/items/add">
            ➕ Add Item
          </Link>

          <Link style={styles.link} to="/purchase">
            🛒 Purchase
          </Link>

          <Link style={styles.link} to="/purchase-view">
            📄 Purchase History
          </Link>
        </>
      )}

      {/* INVOICE USER + ADMIN */}
      {(isAdmin() || isInvoiceUser()) && (
        <>
          <p style={styles.section}>Invoices</p>
          <Link style={styles.link} to="/invoice">
            ➕ Create Invoice
          </Link>
          <Link style={styles.link} to="/invoice-view">
            📄 Invoice List
          </Link>

          <p style={styles.section}>Customers</p>
          <Link style={styles.link} to="/customers">
            👥 Customers
          </Link>
          <Link style={styles.link} to="/customer-ledger">
            📒 Customer Ledger
          </Link>
          <Link style={styles.link} to="/payments">
            💰 Payment Collection
          </Link>
        </>
      )}
      <button style={styles.logoutBtn} onClick={logout}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 260,
    background: "#1e293b",
    color: "#fff",
    padding: 20,
    minHeight: "100vh",
  },

  userBox: {
    background: "#334155",
    padding: 15,
    borderRadius: 12,
    textAlign: "center",
    marginBottom: 20,
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: 10,
  },

  logo: {
    marginBottom: 20,
  },

  section: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 12,
    opacity: 0.6,
    textTransform: "uppercase",
  },

  link: {
    display: "block",
    padding: "10px 0",
    color: "#fff",
    textDecoration: "none",
  },

  logoutBtn: {
    marginTop: 30,
    width: "100%",
    padding: 10,
    border: "none",
    borderRadius: 8,
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
  },
};
