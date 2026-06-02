import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddCustomer() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    gst_number: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    opening_balance: 0,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/customers", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Customer added");
      navigate("/customers");
    } catch (err) {
      toast.error("Error adding customer");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Add Customer</h1>
          <p style={styles.subtitle}>Create customer profile with GST and balance</p>
        </div>

        <button style={styles.secondaryBtn} onClick={() => navigate("/customers")}>
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.sectionHeader}>Customer Details</div>

        <div style={styles.grid}>
          <label style={styles.field}>
            <span style={styles.label}>Customer Name</span>
            <input
              type="text"
              name="customer_name"
              placeholder="Customer name"
              value={form.customer_name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Phone</span>
            <input
              type="text"
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Email</span>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>GST Number</span>
            <input
              type="text"
              name="gst_number"
              placeholder="GST number"
              value={form.gst_number}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>City</span>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>State</span>
            <input
              type="text"
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Pincode</span>
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={form.pincode}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Opening Balance</span>
            <input
              type="number"
              name="opening_balance"
              placeholder="Opening balance"
              value={form.opening_balance}
              onChange={handleChange}
              style={styles.input}
            />
          </label>
        </div>

        <label style={styles.fieldFull}>
          <span style={styles.label}>Address</span>
          <textarea
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            style={{ ...styles.input, ...styles.textarea }}
          />
        </label>

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.secondaryBtn}
            onClick={() => navigate("/customers")}
          >
            Cancel
          </button>
          <button type="submit" style={styles.primaryBtn}>
            Save Customer
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: {
    padding: 10,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 28,
    color: "#0f172a",
  },
  subtitle: {
    margin: "4px 0 0",
    color: "#64748b",
  },
  card: {
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    padding: 16,
  },
  sectionHeader: {
    background: "#0f172a",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 8,
    fontWeight: 700,
    marginBottom: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  field: {
    display: "grid",
    gap: 5,
  },
  fieldFull: {
    display: "grid",
    gap: 5,
    marginTop: 12,
  },
  label: {
    color: "#475569",
    fontSize: 12,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 10px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    outline: "none",
  },
  textarea: {
    minHeight: 78,
    resize: "vertical",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  primaryBtn: {
    padding: "10px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryBtn: {
    padding: "10px 14px",
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
  },
};
