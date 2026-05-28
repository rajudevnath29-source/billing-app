import { useEffect, useState } from "react";

import axios from "axios";

export default function StockHistory() {
  const [history, setHistory] = useState([]);

  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  // ====================================
  // LOAD HISTORY
  // ====================================

  const loadHistory = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/stock-history",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setHistory(res.data.history);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // ====================================
  // FILTER
  // ====================================

  const filtered = history.filter((h) =>
    h.item?.item_name?.toLowerCase().includes(search.toLowerCase()),
  );

  // ====================================
  // BADGE COLOR
  // ====================================

  const getColor = (type) => {
    switch (type) {
      case "SALE":
        return "#ef4444";

      case "PURCHASE":
        return "#22c55e";

      case "RETURN":
        return "#3b82f6";

      case "MANUAL_EDIT":
        return "#f59e0b";

      case "DAMAGE":
        return "#6b7280";

      default:
        return "#000";
    }
  };

  return (
    <div style={page}>
      <h1>📦 Stock History</h1>

      {/* SEARCH */}

      <input
        placeholder="Search Item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchBox}
      />

      {/* TABLE */}

      <table style={table}>
        <thead>
          <tr>
            <th>Item</th>

            <th>Type</th>

            <th>Qty</th>

            <th>Prev Stock</th>

            <th>New Stock</th>

            <th>Note</th>

            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((h) => (
            <tr key={h._id}>
              <td>{h.item?.item_name}</td>

              <td>
                <span
                  style={{
                    background: getColor(h.type),

                    color: "#fff",

                    padding: "4px 8px",

                    borderRadius: 6,

                    fontSize: 12,
                  }}
                >
                  {h.type}
                </span>
              </td>

              <td>{h.qty}</td>

              <td>{h.previous_stock}</td>

              <td>{h.new_stock}</td>

              <td>{h.note}</td>

              <td>{new Date(h.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ====================================
   STYLES
==================================== */

const page = {
  padding: 20,
};

const searchBox = {
  padding: 10,
  width: "100%",
  marginBottom: 20,
  border: "1px solid #ddd",
  borderRadius: 6,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
};
