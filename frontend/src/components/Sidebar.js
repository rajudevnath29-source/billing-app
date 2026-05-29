import { Link } from "react-router-dom";

import { getUser } from "../utils/role";
import { hasPermission } from "../utils/permissions";

export default function Sidebar({ collapsed, hovered, setHovered }) {
  const user = getUser();

  const expanded = !collapsed || hovered;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.sidebar,
        width: expanded ? 260 : 80,
      }}
    >
      {/* LOGO */}
      <h2 style={styles.logo}>{expanded ? "🧾 ERP" : "🧾"}</h2>

      {/* USER */}
      <div style={styles.userBox}>
        <img
          src={
            user?.profile_image
              ? `http://localhost:5000/uploads/${user.profile_image}`
              : "https://i.pravatar.cc/80"
          }
          alt="profile"
          style={styles.image}
        />

        {expanded && (
          <>
            <h4>{user?.name}</h4>

            <small>{user?.role}</small>
          </>
        )}
      </div>

      {/* DASHBOARD */}
      <Link style={styles.link} to="/dashboard">
        📊 {expanded && "Dashboard"}
      </Link>

      {/* PROFILE */}
      <Link style={styles.link} to="/profile">
        👤 {expanded && "Profile"}
      </Link>

      {/* ITEMS MODULE */}
      {hasPermission("ITEMS_MODULE") && (
        <>
          {expanded && <p style={styles.section}>Inventory</p>}

          <Link style={styles.link} to="/items">
            📦 {expanded && "Items"}
          </Link>

          {hasPermission("ADD_ITEM") && (
            <Link style={styles.link} to="/items/add">
              ➕ {expanded && "Add Item"}
            </Link>
          )}

          {hasPermission("PURCHASE_MODULE") && (
            <Link style={styles.link} to="/purchase">
              🛒 {expanded && "Purchase"}
            </Link>
          )}

          {hasPermission("VIEW_PURCHASE") && (
            <Link style={styles.link} to="/purchase-view">
              📄 {expanded && "Purchase History"}
            </Link>
          )}
        </>
      )}

      {/* INVOICE MODULE */}
      {hasPermission("INVOICE_MODULE") && (
        <>
          {expanded && <p style={styles.section}>Invoices</p>}

          {hasPermission("CREATE_INVOICE") && (
            <Link style={styles.link} to="/invoice">
              ➕ {expanded && "Create Invoice"}
            </Link>
          )}

          <Link style={styles.link} to="/invoice-view">
            📄 {expanded && "Invoice List"}
          </Link>

          {expanded && <p style={styles.section}>Customers</p>}

          <Link style={styles.link} to="/customers">
            👥 {expanded && "Customers"}
          </Link>

          <Link style={styles.link} to="/customer-ledger">
            📒 {expanded && "Customer Ledger"}
          </Link>

          <Link style={styles.link} to="/payments">
            💰 {expanded && "Payments"}
          </Link>
        </>
      )}

      {/* REPORTS */}
      {hasPermission("REPORTS_MODULE") && (
        <>
          {expanded && <p style={styles.section}>Reports</p>}

          <Link style={styles.link} to="/reports">
            📊 {expanded && "Reports"}
          </Link>
        </>
      )}

      {/* ACCOUNTS */}
      {hasPermission("ACCOUNTS_MODULE") && (
        <>
          {expanded && <p style={styles.section}>Accounts</p>}

          <Link style={styles.link} to="/expenses">
            💸 {expanded && "Expenses"}
          </Link>

          <Link style={styles.link} to="/accounts">
            🏦 {expanded && "Accounts"}
          </Link>

          <Link style={styles.link} to="/vouchers">
            💳 {expanded && "Vouchers"}
          </Link>
        </>
      )}

      {/* STOCK */}
      {hasPermission("STOCK_MODULE") && (
        <>
          {expanded && <p style={styles.section}>Stock</p>}

          <Link style={styles.link} to="/stock-history">
            📊 {expanded && "Stock History"}
          </Link>
        </>
      )}

      {/* USERS */}
      {hasPermission("VIEW_USERS") && (
        <>
          {expanded && <p style={styles.section}>Users</p>}

          <Link style={styles.link} to="/users">
            👥 {!expanded ? "" : "User List"}
          </Link>

          {hasPermission("MANAGE_ROLES") && (
            <Link style={styles.link} to="/roles">
              👑 {!expanded ? "" : "Roles"}
            </Link>
          )}

          {hasPermission("MANAGE_PERMISSIONS") && (
            <Link style={styles.link} to="/permissions">
              🛡️ {!expanded ? "" : "Permissions"}
            </Link>
          )}
        </>
      )}
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
    overflowY: "auto",
    overflowX: "hidden",
    transition: "0.3s",
  },

  logo: {
    marginBottom: 20,
  },

  userBox: {
    background: "#334155",
    padding: 15,
    borderRadius: 16,
    textAlign: "center",
    marginBottom: 20,
  },

  image: {
    width: 55,
    height: 55,
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: 10,
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
};
