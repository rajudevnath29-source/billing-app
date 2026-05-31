import { useEffect, useState } from "react";

import axios from "axios";

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

  const token = localStorage.getItem("token");

  // ====================================
  // FETCH DATA
  // ====================================

  const loadData = async () => {
    try {
      // SALES
      const invoiceRes = await axios.get(
        "http://localhost:5000/api/invoices",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // PURCHASES
      const purchaseRes = await axios.get(
        "http://localhost:5000/api/purchases",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ITEMS
      const itemRes = await axios.get(
        "http://localhost:5000/api/items",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      //Expense
      const expenseRes = await axios.get(
        "http://localhost:5000/api/expenses",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setInvoices(invoiceRes.data.invoices);

      setPurchases(purchaseRes.data.purchases);

      setItems(itemRes.data.items);

      setExpenses(expenseRes.data.expenses);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ====================================
  // CALCULATIONS
  // ====================================
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // SALES
  const totalSales = invoices.reduce(
    (sum, inv) => sum + inv.grand_total,

    0,
  );

  // PURCHASES
  const totalPurchases = purchases.reduce(
    (sum, pur) => sum + pur.grand_total,

    0,
  );

  // PROFIT
  const profit = totalSales - totalPurchases - totalExpenses;

  // GST SALES
  const totalGSTSales = invoices.reduce(
    (sum, inv) => sum + (inv.gst_amount || 0),

    0,
  );

  // GST PURCHASE
  const totalGSTPurchase = purchases.reduce(
    (sum, pur) => sum + (pur.gst_amount || 0),

    0,
  );

  // LOW STOCK
  const lowStockItems = items.filter(
    (item) => item.opening_stock <= item.low_stock_alert,
  );

  const monthlyData = [
    {
      name: "Sales",
      amount: totalSales,
    },

    {
      name: "Purchase",
      amount: totalPurchases,
    },

    {
      name: "Profit",
      amount: profit,
    },
  ];

  const stockData = [
    {
      name: "Low Stock",
      value: lowStockItems.length,
    },

    {
      name: "Safe Stock",
      value: items.length - lowStockItems.length,
    },
  ];

  return (
    <div style={pageStyle} className="compact-screen">
      <h1 style={heading}>📊 ERP Reports</h1>

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
          <h3>Total Expenses</h3>

          <h1>₹ {totalExpenses.toFixed(2)}</h1>
        </div>

        <div
          style={{ ...card, background: profit >= 0 ? "#dcfce7" : "#fee2e2" }}
        >
          <h3>Profit</h3>

          <h1>₹ {profit.toFixed(2)}</h1>
        </div>

        <div style={card}>
          <h3>Low Stock</h3>

          <h1>{lowStockItems.length}</h1>
        </div>
      </div>

      {/* GST REPORT */}
      <div style={reportBox}>
        <h2>🧾 GST Report</h2>

        <table style={table} className="app-table">
          <thead>
            <tr className="table-row">
              <th>Type</th>

              <th>GST Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr className="table-row">
              <td>GST Collected</td>

              <td>₹ {totalGSTSales.toFixed(2)}</td>
            </tr>

            <tr>
              <td>GST Paid</td>

              <td>₹ {totalGSTPurchase.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* LOW STOCK */}
      <div style={reportBox}>
        <h2>⚠️ Low Stock Report</h2>

        <table style={table} className="app-table">
          <thead>
            <tr>
              <th>Item</th>

              <th>Stock</th>

              <th>Alert</th>
            </tr>
          </thead>

          <tbody>
            {lowStockItems.map((item) => (
              <tr key={item._id} className="table-row">
                <td>{item.item_name}</td>

                <td>{item.opening_stock}</td>

                <td>{item.low_stock_alert}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {/* STOCK PIE CHART */}

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
                <Cell key={index} />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ====================================
   STYLES
==================================== */

const pageStyle = {
  padding: 10,
};

const heading = {
  margin: "0 0 14px",
  fontSize: 26,
  color: "#0f172a",
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
  padding: 12,
  borderRadius: 10,
  marginBottom: 16,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
};
