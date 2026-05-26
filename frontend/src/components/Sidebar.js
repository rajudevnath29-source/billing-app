import { Link } from "react-router-dom";
import { isAdmin, isItemManager, isInvoiceUser } from "../utils/role";

export default function Sidebar() {
  return (
    <div style={styles.sidebar}>

      <h3>🧾 Billing System</h3>

      {/* DASHBOARD - ALL USERS */}
      <Link to="/dashboard">📊 Dashboard</Link>
      <br /><br />

      {/* ITEM MODULE */}
      {(isAdmin() || isItemManager()) && (
        <>
          <h4>📦 Items</h4>

          <Link to="/items">View Items</Link>
          <br />

          <Link to="/items/add">➕ Add Item</Link>
          <br /><br />
        </>
      )}

      {/* INVOICE MODULE */}
      {(isAdmin() || isInvoiceUser()) && (
        <>
          <h4>🧾 Invoices</h4>

          <Link to="/invoice">➕ Create Invoice</Link>
          <br />

          <Link to="/invoice-view">📄 Invoice List</Link>
          <br /><br />
        </>
      )}

      {/* ADMIN ONLY */}
      {isAdmin() && (
        <>
          <h4>⚙️ Admin</h4>

          <Link to="/users">👥 Users</Link>
          <br />

          <Link to="/reports">📈 Reports</Link>
          <br />
        </>
      )}

    </div>
  );
}

/* STYLE */
const styles = {
  sidebar: {
    width: 220,
    padding: 20,
    borderRight: "1px solid #ddd",
    height: "100vh"
  }
};