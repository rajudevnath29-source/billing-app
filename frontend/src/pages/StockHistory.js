import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";

export default function StockHistory() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");
  const pageSize = 15;

  const loadHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/stock-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory(res.data.history || []);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filtered = history.filter((h) => {
    const keyword = search.toLowerCase();
    const matchesSearch =
      h.item?.item_name?.toLowerCase().includes(keyword) ||
      h.reference_id?.toLowerCase().includes(keyword) ||
      h.note?.toLowerCase().includes(keyword);

    const matchesType = typeFilter === "ALL" || h.type === typeFilter;
    const createdDate = new Date(h.createdAt);
    const today = new Date();
    const matchesDate =
      dateFilter === "ALL" ||
      (dateFilter === "TODAY" &&
        createdDate.toDateString() === today.toDateString()) ||
      (dateFilter === "MONTH" &&
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear());

    return matchesSearch && matchesType && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageHistory = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const getColor = (type) => {
    switch (type) {
      case "SALE":
        return "#ef4444";
      case "PURCHASE":
        return "#22c55e";
      case "RETURN":
        return "#3b82f6";
      case "ADJUSTMENT":
        return "#f59e0b";
      default:
        return "#64748b";
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Stock History</h1>

      <div style={styles.filterRow}>
        <input
          placeholder="Search item, note or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchBox}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={styles.selectBox}
        >
          <option value="ALL">All Types</option>
          <option value="PURCHASE">Purchase</option>
          <option value="SALE">Sale</option>
          <option value="RETURN">Return</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={styles.selectBox}
        >
          <option value="ALL">All Dates</option>
          <option value="TODAY">Today</option>
          <option value="MONTH">This Month</option>
        </select>
      </div>

      <div className="app-table-card">
        <table style={styles.table} className="app-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Prev Stock</th>
              <th>New Stock</th>
              <th>Note</th>
              <th>Reference</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {pageHistory.map((h) => (
              <tr key={h._id} className="table-row">
                <td>{h.item?.item_name}</td>
                <td>
                  <span
                    style={{
                      ...styles.badge,
                      background: getColor(h.type),
                    }}
                  >
                    {h.type}
                  </span>
                </td>
                <td>{h.qty}</td>
                <td>{h.previous_stock}</td>
                <td>{h.new_stock}</td>
                <td>{h.note}</td>
                <td>{h.reference_id || "-"}</td>
                <td>{new Date(h.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && <div style={styles.empty}>No stock history found</div>}
      </div>

      {filtered.length > 0 && (
        <div style={styles.pagination}>
          {currentPage > 1 && (
            <button
              style={styles.pageBtn}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Prev
            </button>
          )}

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;

            return (
              <button
                key={page}
                disabled={currentPage === page}
                onClick={() => setCurrentPage(page)}
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === page ? styles.activePageBtn : {}),
                }}
              >
                {page}
              </button>
            );
          })}

          {currentPage < totalPages && (
            <button
              style={styles.pageBtn}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 10,
  },
  heading: {
    margin: "0 0 16px",
    color: "#0f172a",
    fontSize: 26,
  },
  filterRow: {
    display: "flex",
    gap: 10,
    marginBottom: 14,
  },
  searchBox: {
    padding: 10,
    flex: 1,
    border: "1px solid #ddd",
    borderRadius: 6,
  },
  selectBox: {
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 6,
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
  },
  badge: {
    color: "#fff",
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
  },
  empty: {
    padding: 35,
    textAlign: "center",
    color: "#64748b",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  pageBtn: {
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    background: "#e2e8f0",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 700,
  },
  activePageBtn: {
    background: "#2563eb",
    color: "#fff",
    cursor: "not-allowed",
    opacity: 0.85,
  },
};
