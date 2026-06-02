import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { isSuperAdmin } from "../utils/role";
import { hasPermission } from "../utils/permissions";

export default function Sidebar({ collapsed, hovered, setHovered }) {
  const [syncingType, setSyncingType] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
  });

  const expanded = !collapsed || hovered;
  const showSyncAccess = isSuperAdmin();

  const syncAccessMaster = async (type) => {
    if (syncingType) return;
    try {
      setSyncingType(type);

      const token = localStorage.getItem("token");
      const endpoint =
        type === "permissions"
          ? "http://localhost:5000/api/auth/sync-permissions-master"
          : "http://localhost:5000/api/auth/sync-roles-master";

      const res = await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const summary = res.data?.result || {};

      toast.success(
        `${type === "permissions" ? "Permissions" : "Roles"} synced (Inserted: ${summary.inserted || 0}, Updated: ${summary.updated || 0})`,
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Sync failed. Please check backend logs and try again.";
      toast.error(message);
    } finally {
      setSyncingType("");
      setConfirmModal({ open: false, type: "" });
    }
  };

  const openSyncConfirm = (type) => {
    if (syncingType) return;
    setConfirmModal({ open: true, type });
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
      {/* LOGO */}

      {/* <img
        src="/D.png"
        alt="Raaj Computer Services"
        style={expanded ? styles.collapsedlogo : styles.logo}
      /> */}
      <h2 style={styles.logo}>{expanded ? "ERP" : "🧾"}</h2>

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

          {hasPermission("CREATE_PURCHASE") && (
            <Link style={styles.link} to="/purchase">
              🛒 {expanded && "Purchase"}
            </Link>
          )}

          {hasPermission("VIEW_PURCHASE") && (
            <Link style={styles.link} to="/purchase-view">
              📄 {expanded && "Purchase View"}
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

          <Link style={styles.link} to="/bulk-invoice">
            📁 {expanded && "Bulk Invoice"}
          </Link>

          {expanded && <p style={styles.section}>Customers</p>}

          <Link style={styles.link} to="/customers/add">
            🧑 {expanded && "Add Customer"}
          </Link>

          <Link style={styles.link} to="/customers">
            👥 {expanded && "Customers View"}
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

      {showSyncAccess && (
        <>
          {expanded && <p style={styles.section}>Admin Tools</p>}
          <button
            type="button"
            style={styles.actionBtn}
            onClick={() => openSyncConfirm("permissions")}
            disabled={!!syncingType}
            title="Sync permissions"
          >
            🛡️{" "}
            {expanded &&
              (syncingType === "permissions"
                ? "Syncing Permissions..."
                : "Sync Permissions")}
          </button>

          <button
            type="button"
            style={styles.actionBtn}
            onClick={() => openSyncConfirm("roles")}
            disabled={!!syncingType}
            title="Sync roles"
          >
            👑{" "}
            {expanded &&
              (syncingType === "roles" ? "Syncing Roles..." : "Sync Roles")}
          </button>
        </>
      )}

      {confirmModal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>🔄</div>
            <h2 style={styles.modalTitle}>
              Sync{" "}
              {confirmModal.type === "permissions" ? "Permissions" : "Roles"}?
            </h2>
            <p style={styles.modalText}>
              This will update existing records and insert missing ones without
              deleting old data.
            </p>
            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => setConfirmModal({ open: false, type: "" })}
                disabled={!!syncingType}
              >
                Cancel
              </button>
              <button
                style={styles.confirmBtn}
                onClick={() => syncAccessMaster(confirmModal.type)}
                disabled={!!syncingType}
              >
                {syncingType ? "Syncing..." : "Confirm Sync"}
              </button>
            </div>
          </div>
        </div>
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
  actionBtn: {
    width: "100%",
    border: "1px solid #64748b",
    background: "#0f172a",
    color: "#fff",
    padding: "10px 8px",
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "left",
    marginTop: 4,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    width: 420,
    padding: 24,
    borderRadius: 20,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    color: "#0f172a",
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalTitle: {
    margin: 0,
  },
  modalText: {
    color: "#64748b",
    marginTop: 10,
    lineHeight: 1.6,
  },
  modalActions: {
    display: "flex",
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    border: "none",
    padding: 12,
    borderRadius: 12,
    background: "#e2e8f0",
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 1,
    border: "none",
    padding: 12,
    borderRadius: 12,
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  logo: {
    height: 20,
    width: 80,
    objectFit: "contain",
    objectPosition: "left center",
    marginTop: 15,
    marginBottom: 15,
  },
  collapsedlogo: {
    height: 50,
    marginLeft: 50,
    marginTop: 15,
    marginBottom: 15,
  },
};
