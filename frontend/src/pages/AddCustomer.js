import { useState } from "react";
import axios from "axios";
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

  // HANDLE CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/customers", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Customer added");

      navigate("/customers");
    } catch (err) {
      alert("Error adding customer");
    }
  };

  return (
    <>
      <h2>➕ Add Customer</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="customer_name"
          placeholder="Customer Name"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="gst_number"
          placeholder="GST Number"
          onChange={handleChange}
          style={styles.input}
        />

        <textarea
          name="address"
          placeholder="Address"
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="state"
          placeholder="State"
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="number"
          name="opening_balance"
          placeholder="Opening Balance"
          onChange={handleChange}
          style={styles.input}
        />

        <button style={styles.btn}>Save Customer</button>
      </form>
    </>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: 400,
    marginTop: 20,
  },

  input: {
    padding: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
  },

  btn: {
    padding: 12,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
