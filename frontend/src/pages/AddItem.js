import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AddItem() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    item_name: "",
    unit: "Pcs",
    sales_price: "",
    purchase_price: "",
    opening_stock: 1,
    low_stock_alert: 0,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/items", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Item Added Successfully");

      navigate("/items");
    } catch (err) {
      toast.error("Error adding item");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>📦 Add New Item</h1>

          <p style={styles.subtitle}>Create and manage inventory items</p>
        </div>

        <form onSubmit={submit}>
          <div style={styles.grid}>
            <div style={styles.inputGroup}>
              <label>Item Name</label>

              <input
                type="text"
                name="item_name"
                value={form.item_name}
                onChange={handleChange}
                placeholder="Enter item name"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Unit</label>

              <input
                type="text"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="Pcs, Box, Set, etc."
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Sales Price</label>

              <input
                type="number"
                name="sales_price"
                value={form.sales_price}
                onChange={handleChange}
                placeholder="0.00"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Purchase Price</label>

              <input
                type="number"
                name="purchase_price"
                value={form.purchase_price}
                onChange={handleChange}
                placeholder="0.00"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Opening Stock</label>

              <input
                type="number"
                name="opening_stock"
                value={form.opening_stock}
                onChange={handleChange}
                placeholder="Current stock quantity"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Low Stock Alert</label>

              <input
                type="number"
                name="low_stock_alert"
                value={form.low_stock_alert}
                onChange={handleChange}
                placeholder="Minimum quantity"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.buttonWrap}>
            <button type="submit" style={styles.button}>
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
  },

  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 20,
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
  },

  header: {
    marginBottom: 30,
  },

  title: {
    margin: 0,
    fontSize: 28,
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 8,
    color: "#64748b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 20,
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },

  input: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 14,
  },

  buttonWrap: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 30,
  },

  button: {
    padding: "12px 28px",
    border: "none",
    borderRadius: 12,
    background: "#2563eb",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
};
