import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function AddItem() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    item_name: "",
    unit: "",
    sales_price: "",
    purchase_price: "",
    opening_stock: "",
    low_stock_alert: ""
  });

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submit = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/items",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Item Added Successfully");
      navigate("/items");

    } catch (err) {
      alert("Error adding item");
    }
  };

  return (
    <Layout>

      <h2>➕ Add Item</h2>

      <div style={formBox}>

        <input
          name="item_name"
          placeholder="Item Name"
          onChange={handleChange}
        />

        <input
          name="unit"
          placeholder="Unit (pcs, kg)"
          onChange={handleChange}
        />

        <input
          name="sales_price"
          placeholder="Sales Price"
          onChange={handleChange}
        />

        <input
          name="purchase_price"
          placeholder="Purchase Price"
          onChange={handleChange}
        />

        <input
          name="opening_stock"
          placeholder="Opening Stock"
          onChange={handleChange}
        />

        <input
          name="low_stock_alert"
          placeholder="Low Stock Alert"
          onChange={handleChange}
        />

        <button onClick={submit}>
          Save Item
        </button>

      </div>

    </Layout>
  );
}

const formBox = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  width: 300
};