import { Link } from "react-router-dom";
import { isAdmin, isItemManager, isInvoiceUser } from "../utils/role";

export default function Sidebar() {
  return (
    <div style={styles.sidebar}>

      <h2 style={styles.logo}>🧾 ERP</h2>

      <Link style={styles.link} to="/dashboard">📊 Dashboard</Link>

      {isAdmin()  && (
        <>
          <p style={styles.section}>Reports</p>
          <Link style={styles.link} to="/reports">📊 Reports</Link>

          <p style={styles.section}>Accounts</p>
          <Link style={styles.link} to="/expenses">💸 Expenses</Link>

          <p style={styles.section}>Accounts</p>
          <Link style={styles.link} to="/accounts">🏦 Accounts</Link>
          <Link style={styles.link} to="/vouchers">💳 Vouchers</Link>
        </>
        
      )}

      {(isAdmin() || isItemManager()) && (
        <>
          <p style={styles.section}>Items</p>
          <Link style={styles.link} to="/items">📦 View Items</Link>
          <Link style={styles.link} to="/items/add">➕ Add Item</Link>
          <Link style={styles.link} to="/purchase">🛒 Purchase</Link>
          <Link style={styles.link}  to="/purchase-view">📄 Purchase History</Link>
        </>
      )}

      {(isAdmin() || isInvoiceUser()) && (
        <>
          <p style={styles.section}>Invoices</p>
          <Link style={styles.link} to="/invoice">➕ Create Invoice</Link>
          <Link style={styles.link} to="/invoice-view">📄 Invoice List</Link>


          <p style={styles.section}>Customers</p>
          <Link style={styles.link} to="/customers">👥 Customers</Link>
          <Link style={styles.link} to="/customer-ledger">📒 Customer Ledger</Link>
          <Link style={styles.link} to="/payments">💰 Payments</Link>
        </>
      )}

    </div>
  );
}

const styles = {
  sidebar: {
    width: 240,
    background: "#1e293b",
    color: "#fff",
    padding: 20,
    minHeight: "100vh"
  },

  logo: {
    marginBottom: 20
  },

  section: {
    marginTop: 20,
    fontSize: 12,
    opacity: 0.6
  },

  link: {
    display: "block",
    padding: "8px 0",
    color: "#fff",
    textDecoration: "none"
  }
};