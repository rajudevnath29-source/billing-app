import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../config/api";

export default function GstSettings() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    business_name: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    state_code: "",
    pincode: "",
    phone: "",
    email: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    pan_number: "",
    invoice_prefix: "INV",
    terms_and_conditions: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/gst-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        setForm({
          business_name: res.data.business_name || "",
          gstin: res.data.gstin || "",
          address: res.data.address || "",
          city: res.data.city || "",
          state: res.data.state || "",
          state_code: res.data.state_code || "",
          pincode: res.data.pincode || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          bank_name: res.data.bank_name || "",
          account_number: res.data.account_number || "",
          ifsc_code: res.data.ifsc_code || "",
          pan_number: res.data.pan_number || "",
          invoice_prefix: res.data.invoice_prefix || "INV",
          terms_and_conditions: res.data.terms_and_conditions || "",
        });
      }

      setLoading(false);
    } catch (error) {
      toast.error("Failed to load GST settings");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await axios.put(`${API_URL}/gst-settings`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("GST Settings saved successfully");
      setSaving(false);
    } catch (err) {
      toast.error("Error saving GST settings");
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading GST Settings...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>GST Settings</h1>
          <p style={styles.subtitle}>
            Configure your business GST details for compliance
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.sectionHeader}>Business Details</div>

        <div style={styles.grid}>
          <label style={styles.field}>
            <span style={styles.label}>Business Name</span>
            <input
              type="text"
              name="business_name"
              placeholder="Your business name"
              value={form.business_name}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>GSTIN</span>
            <input
              type="text"
              name="gstin"
              placeholder="22AAAAA0000A1Z5"
              value={form.gstin}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>PAN Number</span>
            <input
              type="text"
              name="pan_number"
              placeholder="ABCDE1234F"
              value={form.pan_number}
              onChange={handleChange}
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
            <span style={styles.label}>Invoice Prefix</span>
            <input
              type="text"
              name="invoice_prefix"
              placeholder="INV"
              value={form.invoice_prefix}
              onChange={handleChange}
              style={styles.input}
            />
          </label>
        </div>

        <label style={styles.fieldFull}>
          <span style={styles.label}>Address</span>
          <textarea
            name="address"
            placeholder="Business address"
            value={form.address}
            onChange={handleChange}
            style={{ ...styles.input, ...styles.textarea }}
          />
        </label>

        <div style={styles.sectionHeader}>Location Details</div>

        <div style={styles.grid}>
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
            <span style={styles.label}>State Code</span>
            <input
              type="text"
              name="state_code"
              placeholder="22"
              value={form.state_code}
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
        </div>

        <div style={styles.sectionHeader}>Bank Details</div>

        <div style={styles.grid}>
          <label style={styles.field}>
            <span style={styles.label}>Bank Name</span>
            <input
              type="text"
              name="bank_name"
              placeholder="Bank name"
              value={form.bank_name}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Account Number</span>
            <input
              type="text"
              name="account_number"
              placeholder="Account number"
              value={form.account_number}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>IFSC Code</span>
            <input
              type="text"
              name="ifsc_code"
              placeholder="IFSC code"
              value={form.ifsc_code}
              onChange={handleChange}
              style={styles.input}
            />
          </label>
        </div>

        <div style={styles.sectionHeader}>Invoice Terms</div>

        <label style={styles.fieldFull}>
          <span style={styles.label}>Terms and Conditions</span>
          <textarea
            name="terms_and_conditions"
            placeholder="Terms and conditions for invoices"
            value={form.terms_and_conditions}
            onChange={handleChange}
            style={{ ...styles.input, ...styles.textarea }}
          />
        </label>

        <div style={styles.actions}>
          <button
            type="submit"
            style={styles.primaryBtn}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
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
  loading: {
    padding: 50,
    textAlign: "center",
    fontSize: 18,
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
    marginTop: 20,
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
};
