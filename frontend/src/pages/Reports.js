import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { API_URL } from "../config/api";
import { hasPermission } from "../utils/permissions";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Reports() {
  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const pageRef = useRef();

  // =========================
  // FETCH DATA
  // =========================
  const loadData = useCallback(async () => {
    try {
      const invoiceRes = await axios.get(`${API_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const purchaseRes = await axios.get(`${API_URL}/purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const itemRes = await axios.get(`${API_URL}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const expenseRes = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInvoices(invoiceRes.data.invoices || []);
      setPurchases(purchaseRes.data.purchases || []);
      setItems(itemRes.data.items || []);
      setExpenses(expenseRes.data.expenses || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =========================
  // CALCULATIONS
  // =========================
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + (exp.amount || 0),
    0,
  );

  const totalSales = invoices.reduce(
    (sum, inv) => sum + (inv.grand_total || 0),
    0,
  );

  const totalPurchases = purchases.reduce(
    (sum, pur) => sum + (pur.grand_total || 0),
    0,
  );

  const pendingPayments = invoices.reduce(
    (sum, inv) => sum + (inv.due_amount || 0),
    0,
  );

  const profit = totalSales - totalPurchases - totalExpenses;
  const actualProfit = profit - pendingPayments;

  const totalGSTSales = invoices.reduce(
    (sum, inv) => sum + (inv.gst_amount || 0),
    0,
  );

  const totalGSTPurchase = purchases.reduce(
    (sum, pur) => sum + (pur.gst_amount || 0),
    0,
  );

  const lowStockItems = items.filter(
    (item) => item.opening_stock <= item.low_stock_alert,
  );

  const monthlyData = [
    { name: "Sales", amount: totalSales },
    { name: "Purchase", amount: totalPurchases },
    { name: "Expenses", amount: totalExpenses },
    { name: "Pending", amount: pendingPayments },
    { name: "Profit", amount: profit },
    { name: "Actual Profit", amount: actualProfit },
  ];

  const stockData = [
    { name: "Low Stock", value: lowStockItems.length },
    { name: "Safe Stock", value: items.length - lowStockItems.length },
  ];

  // =========================
  // EXCEL EXPORT
  // =========================
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summary = [
      { Type: "Total Sales", Amount: totalSales },
      { Type: "Total Purchases", Amount: totalPurchases },
      { Type: "Total Expenses", Amount: totalExpenses },
      { Type: "Pending Payments", Amount: pendingPayments },
      { Type: "Profit", Amount: profit },
      { Type: "Actual Profit", Amount: actualProfit },
      { Type: "GST Sales", Amount: totalGSTSales },
      { Type: "GST Purchase", Amount: totalGSTPurchase },
    ];

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(summary),
      "Summary",
    );

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items), "Items");

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(lowStockItems),
      "Low Stock",
    );

    XLSX.writeFile(wb, "ERP_Report.xlsx");
  };

  // =========================
  // PDF EXPORT
  // =========================
  const exportPDF = async () => {
    const canvas = await html2canvas(pageRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;

    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save("ERP_Report.pdf");
  };

  if (loading) {
    return <div style={loadingdiv}>Loading reports...</div>;
  }

  // =========================
  // UI
  // =========================
  return (
    <div ref={pageRef} style={pageStyle} className="compact-screen">
      <div style={headerRow}>
        <h1 style={heading}>📊 ERP Reports</h1>

        {hasPermission("EXPORT_REPORT") && (
          <div style={buttonRow}>
            <button onClick={exportExcel} style={btnGreen}>
              📥 Excel Export
            </button>

            <button onClick={exportPDF} style={btnRed}>
              📄 PDF Export
            </button>
          </div>
        )}
      </div>

      {/* TOP CARDS */}
      <div style={cardGrid}>
        <div style={card}>
          <h3>Total Sales</h3>
          <h1>₹ {totalSales.toFixed(2)}</h1>
        </div>

        <div style={card}>
          <h3>Total Purchase</h3>
          <h1>₹ {totalPurchases.toFixed(2)}</h1>
        </div>

        <div style={card}>
          <h3>Total Pending</h3>
          <h1>₹ {pendingPayments.toFixed(2)}</h1>
        </div>

        <div style={card}>
          <h3>Total Expenses</h3>
          <h1>₹ {totalExpenses.toFixed(2)}</h1>
        </div>

        <div
          style={{ ...card, background: profit >= 0 ? "#dcfce7" : "#fee2e2" }}
        >
          <h3>Profit</h3>
          <h1>₹ {profit.toFixed(2)}</h1>
        </div>

        <div
          style={{
            ...card,
            background: actualProfit >= 0 ? "#dcfce7" : "#fee2e2",
          }}
        >
          <h3>Actual Profit</h3>
          <h1>₹ {actualProfit.toFixed(2)}</h1>
        </div>

        <div style={card}>
          <h3>Low Stock</h3>
          <h1>{lowStockItems.length}</h1>
        </div>
      </div>

      {/* GST REPORT */}
      <div style={reportBox}>
        <h2>🧾 GST Report</h2>
        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Type</th>
                <th style={th}>GST Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr style={tr}>
                <td style={td}>GST Collected</td>
                <td style={td}>₹ {totalGSTSales.toFixed(2)}</td>
              </tr>

              <tr style={tr}>
                <td style={td}>GST Paid</td>
                <td style={td}>₹ {totalGSTPurchase.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* LOW STOCK */}
      <div style={reportBox}>
        <h2>⚠️ Low Stock Report</h2>
        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Item</th>
                <th style={th}>Stock</th>
                <th style={th}>Alert</th>
              </tr>
            </thead>

            <tbody>
              {lowStockItems.map((item) => (
                <tr key={item._id} style={tr}>
                  <td style={td}>{item.item_name}</td>
                  <td style={td}>{item.opening_stock}</td>
                  <td style={td}>{item.low_stock_alert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SALES CHART */}
      <div style={reportBox}>
        <h2>📈 Business Analytics</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* STOCK CHART */}
      <div style={reportBox}>
        <h2>📦 Inventory Analytics</h2>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={stockData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >
              {stockData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.name === "Low Stock" ? "#ef4444" : "#22c55e"}
                />
              ))}
            </Pie>

            <Tooltip formatter={(value, name) => [`${value} Items`, name]} />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================
const pageStyle = { padding: 10 };

const heading = {
  fontSize: 22,
  margin: 0,
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginBottom: 16,
};

const card = {
  background: "#fff",
  padding: 12,
  borderRadius: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const reportBox = {
  background: "#fff",
  padding: 10,
  borderRadius: 10,
  marginBottom: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const tableWrapper = {
  overflow: "hidden",
  borderRadius: 8,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const th = {
  background: "#0f172a",
  color: "#fff",
  padding: "8px 12px",
  textAlign: "left",
  fontSize: 13,
  fontWeight: 600,
};
const td = {
  padding: "8px 12px",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 13,
};

const tr = {
  transition: "0.2s ease",
};

const btnGreen = {
  background: "#16a34a",
  color: "#fff",
  padding: "5px 10px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 5,
};

const btnRed = {
  background: "#dc2626",
  color: "#fff",
  padding: "5px 10px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 5,
};
const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const buttonRow = {
  display: "flex",
  gap: 8,
};

const loadingdiv = {
  padding: 50,
  textAlign: "center",
  fontSize: 18,
};
