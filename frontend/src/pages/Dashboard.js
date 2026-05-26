import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {

  const [items, setItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // FETCH ITEMS
  const getItems = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/items",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setItems(res.data.items || []);
  };

  // FETCH INVOICES
  const getInvoices = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/invoices",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setInvoices(res.data.invoices || []);
  };

  useEffect(() => {

    const load = async () => {
      setLoading(true);

      await getItems();
      await getInvoices();

      setLoading(false);
    };

    load();

  }, []);

  // TOTAL SALES
  const totalSales = invoices.reduce(
    (sum, inv) => sum + (inv.grand_total || 0),
    0
  );

  // LOW STOCK
  const lowStockItems = items.filter(
    (item) =>
      item.opening_stock <= item.low_stock_alert
  );

  // CHART DATA
  const chartData = invoices.map((inv, index) => ({
    name: `Inv ${index + 1}`,
    amount: inv.grand_total
  }));

  return (
    <Layout>

      <div style={styles.container}>

        <h1 style={styles.title}>
          📊 ERP Dashboard
        </h1>

        {loading ? (
          <h3>Loading...</h3>
        ) : (
          <>

            {/* STATS */}
            <div style={styles.grid}>

              <div style={styles.card}>
                <h4>💰 Total Sales</h4>
                <h2>₹ {totalSales}</h2>
              </div>

              <div style={styles.card}>
                <h4>🧾 Invoices</h4>
                <h2>{invoices.length}</h2>
              </div>

              <div style={styles.card}>
                <h4>📦 Items</h4>
                <h2>{items.length}</h2>
              </div>

              <div style={styles.cardDanger}>
                <h4>⚠️ Low Stock</h4>
                <h2>{lowStockItems.length}</h2>
              </div>

            </div>

            {/* CHART */}
            <div style={styles.chartBox}>

              <h2>📈 Sales Analytics</h2>

              <ResponsiveContainer width="100%" height={350}>

                <BarChart data={chartData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="amount"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

            {/* LOW STOCK */}
            <div style={styles.section}>

              <h2>⚠️ Low Stock Items</h2>

              {lowStockItems.length === 0 ? (
                <p>All stock is healthy 👍</p>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item._id}
                    style={styles.itemCard}
                  >
                    <b>{item.item_name}</b>

                    <p>
                      Stock: {item.opening_stock}
                    </p>

                    <p>
                      Alert: {item.low_stock_alert}
                    </p>

                  </div>
                ))
              )}

            </div>

          </>
        )}

      </div>

    </Layout>
  );
}

/* ================= STYLES ================= */

const styles = {

  container: {
    padding: 20
  },

  title: {
    marginBottom: 20
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    textAlign: "center"
  },

  cardDanger: {
    background: "#fff5f5",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #ffd6d6",
    textAlign: "center"
  },

  chartBox: {
    background: "#fff",
    marginTop: 40,
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },

  section: {
    marginTop: 40,
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },

  itemCard: {
    padding: 12,
    borderBottom: "1px solid #eee"
  }

};