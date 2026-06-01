import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expence, setExpence] = useState([]);

  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("today");

  const [time, setTime] = useState(new Date());

  const user = JSON.parse(localStorage.getItem("user"));

  const token = localStorage.getItem("token");
  const role = user?.role;

  // =========================
  // LIVE TIME
  // =========================
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const itemRes = await axios.get("http://localhost:5000/api/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const invoiceRes = await axios.get("http://localhost:5000/api/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const expenceRes = await axios.get("http://localhost:5000/api/expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const purchaseRes = await axios.get(
        "http://localhost:5000/api/purchases",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setPurchases(purchaseRes.data.purchases || []);
      setItems(itemRes.data.items || []);
      setInvoices(invoiceRes.data.invoices || []);
      setExpence(expenceRes.data.expenses || []);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // =========================
  // FILTER LOGIC
  // =========================
  const today = new Date();

  const filteredInvoices = invoices.filter((inv) => {
    const invoiceDate = new Date(inv.invoiceDate || inv.createdAt);

    if (filter === "today") {
      return invoiceDate.toDateString() === today.toDateString();
    }

    if (filter === "month") {
      return (
        invoiceDate.getMonth() === today.getMonth() &&
        invoiceDate.getFullYear() === today.getFullYear()
      );
    }

    if (filter === "year") {
      return invoiceDate.getFullYear() === today.getFullYear();
    }

    return true;
  });

  const filteredExpences = expence.filter((inv) => {
    const expenceDate = new Date(inv.createdAt);

    if (filter === "today") {
      return expenceDate.toDateString() === today.toDateString();
    }

    if (filter === "month") {
      return (
        expenceDate.getMonth() === today.getMonth() &&
        expenceDate.getFullYear() === today.getFullYear()
      );
    }

    if (filter === "year") {
      return expenceDate.getFullYear() === today.getFullYear();
    }

    return true;
  });

  const filteredPurchases = purchases.filter((pur) => {
    const purchaseDate = new Date(pur.createdAt);

    if (filter === "today") {
      return purchaseDate.toDateString() === today.toDateString();
    }

    if (filter === "month") {
      return (
        purchaseDate.getMonth() === today.getMonth() &&
        purchaseDate.getFullYear() === today.getFullYear()
      );
    }

    if (filter === "year") {
      return purchaseDate.getFullYear() === today.getFullYear();
    }

    return true;
  });

  const recentInvoices = [...filteredInvoices].sort(
    (a, b) =>
      new Date(b.invoiceDate || b.createdAt) -
      new Date(a.invoiceDate || a.createdAt),
  );

  // =========================
  //
  // =========================
  const totalSales = filteredInvoices.reduce(
    (sum, inv) => sum + (inv.grand_total || 0),
    0,
  );

  const totalExpences = filteredExpences.reduce(
    (sum, inv) => sum + (inv.amount || 0),
    0,
  );

  const totalInvoices = filteredInvoices.length;
  const totalItems = items.length;
  const totalPurchase = filteredPurchases.reduce(
    (sum, pur) => sum + (pur.grand_total || 0),
    0,
  );

  const pendingPayments = filteredInvoices.reduce(
    (sum, inv) => sum + (inv.due_amount || 0),
    0,
  );

  const lowStockItems = items.filter(
    (item) => item.opening_stock <= item.low_stock_alert,
  );
  const profit = totalSales - totalPurchase - totalExpences;
  const actualProfit =
    totalSales - totalPurchase - pendingPayments - totalExpences;

  // =========================
  // CHART DATA
  // =========================
  const salesChartData = filteredInvoices.map((inv, index) => ({
    name: `INV-${index + 1}`,
    sales: inv.grand_total,
  }));

  if (loading) {
    return <h2>Loading Dashboard...</h2>;
  }

  return (
    <div style={styles.page} className="compact-screen">
      {/* ================= HEADER ================= */}
      <div style={styles.topSection}>
        <div>
          <h1 style={styles.heading}>Welcome Back, {user?.name} 👋</h1>

          {/* <p style={styles.subText}>
            {time.toLocaleDateString()} | {time.toLocaleTimeString()}
          </p> */}

          <p style={styles.subText}>
            {time.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            |{" "}
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
        </div>

        {/* FILTERS */}
        <div style={styles.filterBox}>
          <button
            style={
              filter === "today" ? styles.activeFilterBtn : styles.filterBtn
            }
            onClick={() => setFilter("today")}
          >
            Today
          </button>

          <button
            style={
              filter === "month" ? styles.activeFilterBtn : styles.filterBtn
            }
            onClick={() => setFilter("month")}
          >
            Month
          </button>

          <button
            style={
              filter === "year" ? styles.activeFilterBtn : styles.filterBtn
            }
            onClick={() => setFilter("year")}
          >
            Year
          </button>

          <button
            style={
              filter === "overall" ? styles.activeFilterBtn : styles.filterBtn
            }
            onClick={() => setFilter("overall")}
          >
            Overall
          </button>
        </div>
      </div>
      {/* ================= STATS ================= */}
      <div style={styles.statsGrid}>
        {/* ADMIN */}
        {role === "SUPER_ADMIN" && (
          <>
            <div style={styles.card}>
              <h3>💰 Total Sales</h3>
              <h1>₹ {totalSales}</h1>
            </div>

            <div style={styles.card}>
              <h3>🛒 Purchases</h3>
              <h1>₹ {totalPurchase}</h1>
            </div>

            <div style={styles.card}>
              <h3>⏳ Pending</h3>
              <h1>₹ {pendingPayments}</h1>
            </div>

            <div style={styles.card}>
              <h3>💸 Expence</h3>
              <h1>₹ {totalExpences}</h1>
            </div>

            <div style={profit >= 0 ? styles.profitCard : styles.lossCard}>
              <h3>{profit >= 0 ? "📈 Profit" : "📉 Loss"}</h3>

              <h1>₹ {profit}</h1>
            </div>

            <div
              style={actualProfit >= 0 ? styles.profitCard : styles.lossCard}
            >
              <h3>
                {actualProfit >= 0 ? "💎 Actual Profit" : "🔻 Actual Loss"}
              </h3>
              <h1>₹ {actualProfit}</h1>
            </div>

            <div style={styles.card}>
              <h3>🧾 Invoices</h3>
              <h1>{totalInvoices}</h1>
            </div>

            <div style={styles.card}>
              <h3>📦 Items</h3>
              <h1>{totalItems}</h1>
            </div>
            
            <div style={styles.dangerCard}>
              <h3>⚠️ Low Stock</h3>
              <h1>{lowStockItems.length}</h1>
            </div>
          </>
        )}

        {/* ITEM MANAGER */}
        {role === "ITEM_MANAGER" && (
          <>
            <div style={styles.card}>
              <h3>📦 Total Items</h3>
              <h1>{totalItems}</h1>
            </div>

            <div style={styles.card}>
              <h3>🛒 Purchases</h3>
              <h1>₹ {totalPurchase}</h1>
            </div>

            <div style={styles.dangerCard}>
              <h3>⚠️ Low Stock</h3>
              <h1>{lowStockItems.length}</h1>
            </div>
          </>
        )}

        {/* INVOICE USER */}
        {role === "INVOICE_USER" && (
          <>
            <div style={styles.card}>
              <h3>💰 Sales</h3>
              <h1>₹ {totalSales}</h1>
            </div>

            <div style={styles.card}>
              <h3>🧾 Invoices</h3>
              <h1>{totalInvoices}</h1>
            </div>

            <div style={styles.card}>
              <h3>💸 Pending</h3>
              <h1>₹ {pendingPayments}</h1>
            </div>
          </>
        )}
      </div>

      {/* ================= CHARTS ================= */}

      {role !== "ITEM_MANAGER" && (
        <div style={styles.chartGrid}>
          {/* SALES CHART */}
          <div style={styles.chartCard}>
            <h2>📈 Sales Analytics</h2>

            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar dataKey="sales" fill="#7c93e6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* LINE CHART */}
          <div style={styles.chartCard}>
            <h2>📊 Revenue Trend</h2>

            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#7c93e6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* ================= QUICK ACTIONS ================= */}
      <div style={styles.quickSection}>
        <h2>⚡ Quick Actions</h2>

        <div style={styles.quickGrid}>
          {(role === "SUPER_ADMIN" || role === "INVOICE_USER") && (
            <a href="/invoice" style={styles.quickBtn}>
              ➕ Create Invoice
            </a>
          )}
          {(role === "SUPER_ADMIN" || role === "ITEM_MANAGER") && (
            <a href="/items/add" style={styles.quickBtn}>
              📦 Add Item
            </a>
          )}
          {(role === "SUPER_ADMIN" || role === "INVOICE_USER") && (
            <a href="/customers/add" style={styles.quickBtn}>
              👥 Add Customer
            </a>
          )}
          {role === "SUPER_ADMIN" && (
            <a href="/expenses" style={styles.quickBtn}>
              💸 Add Expense
            </a>
          )}
        </div>
      </div>
      {/* RECENT INVOICES */}
      <div style={styles.bottomGrid}>
        {/* RECENT INVOICES */}
        <div style={styles.recentCard}>
          <div style={styles.cardHeader}>
            <h2>🧾 Recent Invoices</h2>

            <a href="/invoice-view" style={styles.viewAll}>
              View All
            </a>
          </div>

          {filteredInvoices.length === 0 ? (
            <p>No invoices found</p>
          ) : (
            recentInvoices.slice(0, 5).map((inv) => (
              <div
                key={inv._id}
                style={styles.invoiceRowHover}
                onClick={() => navigate(`/invoice-edit/${inv._id}`)}
              >
                <div>
                  <strong>{inv.customer_name || "Walk-in Customer"}</strong>

                  <p style={styles.smallText}>
                    Invoice #{inv.invoice_number || inv._id.slice(-5)}
                  </p>
                </div>

                <div style={styles.amount}>₹ {inv.grand_total}</div>
              </div>
            ))
          )}
        </div>

        {/* RECENT PAYMENTS */}
        <div style={styles.recentCard}>
          <div style={styles.cardHeader}>
            <h2>💰 Recent Payments</h2>

            <a href="/payments" style={styles.viewAll}>
              View All
            </a>
          </div>

          {filteredInvoices.length === 0 ? (
            <p>No payments found</p>
          ) : (
            recentInvoices.slice(0, 5).map((inv) => (
              <div key={inv._id} style={styles.invoiceRow}>
                <div>
                  <strong>{inv.customer_name || "Customer"}</strong>

                  <p style={styles.smallText}>Payment Received</p>
                </div>

                <div style={styles.greenAmount}>₹ {inv.grand_total}</div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* ================= LOW STOCK ================= */}
      <div style={styles.lowStockSection}>
        <h2>⚠️ Low Stock Items</h2>

        {lowStockItems.length === 0 ? (
          <p>All inventory looks healthy 👍</p>
        ) : (
          lowStockItems.map((item) => (
            <div key={item._id} style={styles.stockItem}>
              <div>
                <strong>{item.item_name}</strong>
              </div>

              <div>Stock: {item.opening_stock}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: 10,
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12,
  },

  heading: {
    color: "#1e293b",
    margin: "0 0 4px",
    fontSize: 26,
  },

  subText: {
    color: "#64748b",
    margin: 0,
  },

  filterBox: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  filterBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: 8,
    background: "#dbe4ff",
    cursor: "pointer",
    fontWeight: 600,
  },

  activeFilterBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: 8,
    background: "#7c93e6",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
  },

  card: {
    background: "#fff",
    padding: 12,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  dangerCard: {
    background: "#fff5f5",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ffd6d6",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 16,
  },

  chartCard: {
    background: "#fff",
    padding: 12,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  quickSection: {
    marginTop: 16,
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
    gap: 12,
    marginTop: 10,
  },

  quickBtn: {
    background: "#7c93e6",
    color: "#fff",
    textDecoration: "none",
    padding: 12,
    borderRadius: 10,
    textAlign: "center",
    fontWeight: "bold",
    boxShadow: "0 4px 20px rgba(124,147,230,0.3)",
  },

  lowStockSection: {
    background: "#fff",
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  stockItem: {
    padding: 8,
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 16,
  },

  recentCard: {
    background: "#fff",
    padding: 12,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  viewAll: {
    textDecoration: "none",
    color: "#7c93e6",
    fontWeight: "bold",
  },

  invoiceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },

  smallText: {
    fontSize: 13,
    color: "#64748b",
    margin: "2px 0 0",
  },

  amount: {
    fontWeight: "bold",
    color: "#7c93e6",
  },

  greenAmount: {
    fontWeight: "bold",
    color: "#16a34a",
  },
  invoiceRowHover: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    transition: "0.2s",
  },
  profitCard: {
    background: "#ecfdf5",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #bbf7d0",
  },

  lossCard: {
    background: "#fef2f2",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #fecaca",
  },
};
