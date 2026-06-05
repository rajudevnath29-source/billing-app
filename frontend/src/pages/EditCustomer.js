import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config/api";

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`${API_URL}/customers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setForm(res.data.customer || {});
      } catch (error) {
        toast.error("Failed to load customer");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API_URL}/customers/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Customer updated");
      navigate("/customers");
    } catch (error) {
      toast.error("Error updating customer");
    }
  };
  if (loading) {
    return <div style={styles.loading}>Loading customer...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Edit Customer</h1>
          <p style={styles.subtitle}>Update customer profile and balance</p>
        </div>
        <button
          style={styles.secondaryBtn}
          onClick={() => navigate("/customers")}
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.sectionHeader}>Customer Details</div>

        <div style={styles.grid}>
          {fields.map((field) => (
            <label key={field.name} style={styles.field}>
              <span style={styles.label}>{field.label}</span>
              <input
                type={field.type || "text"}
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                style={styles.input}
              />
            </label>
          ))}
        </div>

        <label style={styles.fieldFull}>
          <span style={styles.label}>Address</span>
          <textarea
            name="address"
            value={form.address || ""}
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
            Update Customer
          </button>
        </div>
      </form>
    </div>
  );
}

const fields = [
  { name: "customer_name", label: "Customer Name" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email", type: "email" },
  { name: "gst_number", label: "GST Number" },
  { name: "city", label: "City" },
  { name: "state", label: "State" },
  { name: "pincode", label: "Pincode" },
  { name: "opening_balance", label: "Opening Balance", type: "number" },
];

const styles = {
  page: { padding: 10 },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { margin: 0, fontSize: 28, color: "#0f172a" },
  subtitle: { margin: "4px 0 0", color: "#64748b" },
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
  field: { display: "grid", gap: 5 },
  fieldFull: { display: "grid", gap: 5, marginTop: 12 },
  label: { color: "#475569", fontSize: 12, fontWeight: 700 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 10px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    outline: "none",
  },
  textarea: { minHeight: 78, resize: "vertical" },
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
  loading: {
    padding: 50,
    textAlign: "center",
    fontSize: 18,
  },
};
