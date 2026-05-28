import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Items() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // FETCH ITEMS
  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      await axios.delete(`http://localhost:5000/api/items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchItems();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // SEARCH FILTER
  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(search.toLowerCase()),
  );

  // SORTING
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.item_name.localeCompare(b.item_name);
    } else {
      return b.item_name.localeCompare(a.item_name);
    }
  });

  // PAGINATION
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentItems = sortedItems.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  return (
    <>
      {/* HEADER */}
      <div style={styles.topBar}>
        <h2>📦 Items</h2>

        <button
          style={styles.primaryBtn}
          onClick={() => navigate("/items/add")}
        >
          ➕ Add Item
        </button>
      </div>

      {/* SEARCH + SORT */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={styles.select}
        >
          <option value="asc">Sort A-Z</option>
          <option value="desc">Sort Z-A</option>
        </select>
      </div>

      {/* TABLE */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Unit</th>
            <th style={styles.th}>Sales</th>
            <th style={styles.th}>Purchase</th>
            <th style={styles.th}>Stock</th>
            <th style={styles.th}>Alert</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {currentItems.map((item) => (
            <tr
              key={item._id}
              style={{
                background:
                  item.opening_stock <= item.low_stock_alert
                    ? "#fff5f5"
                    : "#fff",
              }}
              className="table-row"
            >
              <td style={styles.td}>{item.item_name}</td>
              <td style={styles.td}>{item.unit}</td>
              <td style={styles.td}>₹ {item.sales_price}</td>
              <td style={styles.td}>₹ {item.purchase_price}</td>
              <td style={styles.td}>{item.opening_stock}</td>
              <td style={styles.td}>{item.low_stock_alert}</td>

              <td style={styles.td}>
                <button
                  style={styles.editBtn}
                  onClick={() => navigate(`/items/edit/${item._id}`)}
                >
                  ✏️
                </button>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteItem(item._id)}
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div style={styles.pagination}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            style={{
              ...styles.pageBtn,
              background: currentPage === i + 1 ? "#2563eb" : "#e5e7eb",
              color: currentPage === i + 1 ? "#fff" : "#000",
            }}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </>
  );
}

/* ================= STYLES ================= */

const styles = {
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  toolbar: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },

  search: {
    padding: 10,
    width: 250,
    borderRadius: 6,
    border: "1px solid #ccc",
  },

  select: {
    padding: 10,
    borderRadius: 6,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  th: {
    background: "#0f172a",
    color: "#fff",
    padding: 14,
    textAlign: "left",
  },

  td: {
    padding: 14,
    borderBottom: "1px solid #eee",
  },

  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 6,
    cursor: "pointer",
  },

  editBtn: {
    marginRight: 8,
    border: "none",
    padding: 8,
    borderRadius: 5,
    cursor: "pointer",
  },

  deleteBtn: {
    border: "none",
    padding: 8,
    borderRadius: 5,
    cursor: "pointer",
  },

  pagination: {
    marginTop: 20,
    display: "flex",
    gap: 10,
  },

  pageBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
};
