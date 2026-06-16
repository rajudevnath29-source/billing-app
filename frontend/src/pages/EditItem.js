import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../config/api";

export default function EditItem() {
  const { id } = useParams();

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    item_name: "",
    unit: "",
    sales_price: "",
    purchase_price: "",
    opening_stock: "",
    low_stock_alert: "",
    hsn_code: "",
    gst_rate: 18,
  });

  // =========================
  // FETCH ITEM
  // =========================

  const fetchItem = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const item = res.data.items.find((i) => i._id === id);

      if (item) {
        setForm({
          item_name: item.item_name || "",
          unit: item.unit || "Pcs",
          sales_price: item.sales_price || "",
          purchase_price: item.purchase_price || "",
          opening_stock: item.opening_stock || 0,
          low_stock_alert: item.low_stock_alert || 0,
          hsn_code: item.hsn_code || "",
          gst_rate: item.gst_rate || 18,
        });
      }

      setLoading(false);
    } catch (error) {
      toast.error("Failed to load item");
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // UPDATE ITEM
  // =========================

  const updateItem = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API_URL}/items/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Item Updated Successfully");

      navigate("/items");
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading Item...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>✏️ Edit Item</h1>

          <p style={styles.subtitle}>Update item details</p>
        </div>

        <form onSubmit={updateItem}>
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
              <label>
                Opening Stock{" "}
                <small style={{ fontSize: "11px", color: "#e96504" }}>
                  {" "}
                  (Keep 0 if handle purchase)
                </small>
              </label>

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

            <div style={styles.inputGroup}>
              <label>
                HSN Code{" "}
                <small style={{ fontSize: "11px", color: "#64748b" }}>
                  (Required for GST)
                </small>
              </label>

              <input
                type="text"
                name="hsn_code"
                value={form.hsn_code}
                onChange={handleChange}
                placeholder="e.g., 8471"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>GST Rate (%)</label>

              <select
                name="gst_rate"
                value={form.gst_rate}
                onChange={handleChange}
                style={styles.input}
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          <div style={styles.buttonWrap}>
            <button type="submit" style={styles.button}>
              Update Item
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
