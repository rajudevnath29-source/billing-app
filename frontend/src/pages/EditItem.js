import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    item_name: "",
    unit: "",
    sales_price: "",
    purchase_price: "",
    opening_stock: "",
    low_stock_alert: "",
  });

  // GET SINGLE ITEM
  const fetchItem = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const item = res.data.items.find((i) => i._id === id);
      setForm(item);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchItem();
  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // UPDATE ITEM
  const updateItem = async () => {
    try {
      await axios.put(`http://localhost:5000/api/items/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Item Updated Successfully");
      navigate("/items");
    } catch (err) {
      alert("Error updating item");
    }
  };

  return (
    <>
      <h2>✏️ Edit Item</h2>

      <div style={formBox}>
        <input
          name="item_name"
          value={form.item_name}
          onChange={handleChange}
        />

        <input name="unit" value={form.unit} onChange={handleChange} />

        <input
          name="sales_price"
          value={form.sales_price}
          onChange={handleChange}
        />

        <input
          name="purchase_price"
          value={form.purchase_price}
          onChange={handleChange}
        />

        <input
          name="opening_stock"
          value={form.opening_stock}
          onChange={handleChange}
        />

        <input
          name="low_stock_alert"
          value={form.low_stock_alert}
          onChange={handleChange}
        />

        <button onClick={updateItem}>Update Item</button>
      </div>
    </>
  );
}

const formBox = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  width: 300,
};
