import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Items() {
  const [items, setItems] = useState([]);

  const token = localStorage.getItem("token");

  // FETCH ITEMS
  const fetchItems = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/items",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setItems(res.data.items);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // DELETE ITEM
  const deleteItem = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/items/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Item deleted");
      fetchItems();
    } catch (err) {
      alert("Error deleting item");
    }
  };

  return (
    <Layout>

      <h2>📦 Items List</h2>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Unit</th>
            <th>Sales Price</th>
            <th>Purchase Price</th>
            <th>Stock</th>
            <th>Alert</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item._id}
              style={{
                background:
                  item.opening_stock <= item.low_stock_alert
                    ? "#ffe6e6"
                    : "white"
              }}
            >
              <td>{item.item_name}</td>
              <td>{item.unit}</td>
              <td>₹ {item.sales_price}</td>
              <td>₹ {item.purchase_price}</td>
              <td>{item.opening_stock}</td>
              <td>{item.low_stock_alert}</td>

              <td>
                <button onClick={() => deleteItem(item._id)}>
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </Layout>
  );
}

// STYLE
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 20
};