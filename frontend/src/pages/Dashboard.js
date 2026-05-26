import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const token = localStorage.getItem("token");

  // FETCH ITEMS
  const getItems = async () => {
    const res = await axios.get("http://localhost:5000/api/items", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setItems(res.data.items);
  };

  // FETCH INVOICES
  const getInvoices = async () => {
    const res = await axios.get("http://localhost:5000/api/invoices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setInvoices(res.data.invoices);
  };

  useEffect(() => {
    getItems();
    getInvoices();
  }, []);

  // TOTAL SALES
  const totalSales = invoices.reduce((sum, inv) => sum + inv.grand_total, 0);

  // LOW STOCK ITEMS
  const lowStockItems = items.filter(
    (item) => item.opening_stock <= item.low_stock_alert,
  );

  return (
    <Layout>
      <div style={{ padding: 20 }}>
        <h1>📊 Admin Dashboard</h1>

        {/* STATS CARDS */}
        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          <div style={cardStyle}>
            <h3>💰 Total Sales</h3>
            <h2>₹ {totalSales}</h2>
          </div>

          <div style={cardStyle}>
            <h3>🧾 Total Invoices</h3>
            <h2>{invoices.length}</h2>
          </div>

          <div style={cardStyle}>
            <h3>📦 Total Items</h3>
            <h2>{items.length}</h2>
          </div>

          <div style={cardStyle}>
            <h3>⚠️ Low Stock</h3>
            <h2>{lowStockItems.length}</h2>
          </div>
        </div>

        {/* LOW STOCK LIST */}
        <div style={{ marginTop: 40 }}>
          <h2>⚠️ Low Stock Items</h2>

          {lowStockItems.map((item) => (
            <div key={item._id} style={itemStyle}>
              <p>
                <b>{item.item_name}</b>
              </p>
              <p>Stock: {item.opening_stock}</p>
              <p>Alert: {item.low_stock_alert}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

// STYLES
const cardStyle = {
  flex: 1,
  padding: 20,
  background: "#f5f5f5",
  borderRadius: 10,
  textAlign: "center",
};

const itemStyle = {
  padding: 10,
  border: "1px solid #ddd",
  marginTop: 10,
  borderRadius: 5,
};
