import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";

export default function Items() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // DELETE MODAL
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // =========================
  // GET ITEMS
  // =========================
  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(res.data.items || []);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load items");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortOrder]);

  // =========================
  // DELETE ITEM
  // =========================
  const deleteItem = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/items/${selectedItem._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Item deleted successfully");

      setDeleteModal(false);
      setSelectedItem(null);

      fetchItems();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // =========================
  // SEARCH FILTER
  // =========================
  const filteredItems = items.filter((item) =>
    item.item_name?.toLowerCase().includes(search.toLowerCase()),
  );

  // =========================
  // SORTING
  // =========================
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.item_name.localeCompare(b.item_name);
    }

    return b.item_name.localeCompare(a.item_name);
  });

  // =========================
  // PAGINATION
  // =========================
  const indexOfLast = currentPage * itemsPerPage;

  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentItems = sortedItems.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));

  if (loading) {
    return <div style={styles.loading}>Loading Items...</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Inventory Management</h1>

          <p style={styles.subtitle}>Manage products, stock and pricing</p>
        </div>

        <button style={styles.addBtn} onClick={() => navigate("/items/add")}>
          + Add Item
        </button>
      </div>

      {/* SEARCH */}
      <div style={styles.filterCard}>
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

      {/* TABLE CARD */}
      <div style={styles.card} className="app-table-card">
        <table style={styles.table} className="app-table">
          <thead>
            <tr>
              <th style={styles.th}>Item Name</th>

              <th style={styles.th}>Unit</th>

              <th style={styles.th}>Sales Price</th>

              <th style={styles.th}>Purchase Price</th>

              <th style={styles.th}>Stock</th>

              <th style={styles.th}>Status</th>

              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((item) => {
              const lowStock = item.opening_stock <= item.low_stock_alert;

              return (
                <tr key={item._id} className="table-row">
                  <td style={styles.td}>{item.item_name}</td>

                  <td style={styles.td}>{item.unit}</td>

                  <td style={styles.td}>
                    <span className="money-text">₹ {item.sales_price}</span>
                  </td>

                  <td style={styles.td}>
                    <span className="money-text">₹ {item.purchase_price}</span>
                  </td>

                  <td style={styles.td}>{item.opening_stock}</td>

                  <td style={styles.td}>
                    {lowStock ? (
                      <span style={styles.lowStockBadge}>Low Stock</span>
                    ) : (
                      <span style={styles.inStockBadge}>In Stock</span>
                    )}
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actionWrap}>
                      {hasPermission("EDIT_ITEM") && (
                        <button
                          className="app-action-btn app-action-edit"
                          style={styles.iconBtn}
                          title="Edit item"
                          aria-label="Edit item"
                          onClick={() => navigate(`/items/edit/${item._id}`)}
                        >
                          ✎
                        </button>
                      )}
                      {hasPermission("DELETE_ITEM") && (
                        <button
                          className="app-action-btn app-action-delete"
                          style={styles.iconBtn}
                          title="Delete item"
                          aria-label="Delete item"
                          onClick={() => {
                            setSelectedItem(item);

                            setDeleteModal(true);
                          }}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* EMPTY STATE */}
        {currentItems.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📦</div>

            <h3>No Items Found</h3>

            <p>No inventory items match your search criteria.</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {sortedItems.length > 0 && (
        <div style={styles.pagination}>
          {currentPage > 1 && (
            <button
              style={styles.pageBtn}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Prev
            </button>
          )}

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              disabled={currentPage === i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                ...styles.pageBtn,
                ...(currentPage === i + 1 ? styles.activePage : {}),
              }}
            >
              {i + 1}
            </button>
          ))}

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

      {/* DELETE MODAL */}
      {deleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>🗑️</div>

            <h2>Delete Item?</h2>

            <p style={styles.modalText}>
              Are you sure you want to delete
              <strong> {selectedItem?.item_name}</strong>?
            </p>

            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setDeleteModal(false);

                  setSelectedItem(null);
                }}
              >
                Cancel
              </button>

              <button style={styles.confirmDeleteBtn} onClick={deleteItem}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
    marginBottom: 25,
  },

  title: {
    margin: 0,
    fontSize: 30,
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 6,
    color: "#64748b",
  },

  addBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
  },

  filterCard: {
    display: "flex",
    gap: 15,
    marginBottom: 20,
  },

  search: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
  },

  select: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
  },

  card: {
    background: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#0f172a",
    padding: "10px 12px",
    textAlign: "left",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
  },

  td: {
    padding: "8px 12px",
    borderTop: "1px solid #eee",
  },

  actionWrap: {
    display: "flex",
    gap: 8,
  },

  iconBtn: {
    padding: 0,
    fontWeight: 700,
    fontSize: 14,
  },

  editBtn: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },

  deleteBtn: {
    border: "none",
    background: "#ef4444",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },

  inStockBadge: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },

  lowStockBadge: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },

  empty: {
    padding: 50,
    textAlign: "center",
    color: "#64748b",
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },

  pageBtn: {
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    background: "#e2e8f0",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 700,
  },

  activePage: {
    background: "#2563eb",
    color: "#fff",
    cursor: "not-allowed",
    opacity: 0.8,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  modal: {
    background: "#fff",
    width: 420,
    padding: 30,
    borderRadius: 24,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },

  modalIcon: {
    fontSize: 55,
    marginBottom: 10,
  },

  modalText: {
    color: "#64748b",
    marginTop: 10,
    lineHeight: 1.7,
  },

  modalActions: {
    display: "flex",
    gap: 15,
    marginTop: 25,
  },

  cancelBtn: {
    flex: 1,
    border: "none",
    padding: 12,
    borderRadius: 12,
    background: "#e2e8f0",
    cursor: "pointer",
  },

  confirmDeleteBtn: {
    flex: 1,
    border: "none",
    padding: 12,
    borderRadius: 12,
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
};
