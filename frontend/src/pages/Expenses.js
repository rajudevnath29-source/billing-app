import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_URL } from "../config/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");

  const [category, setCategory] = useState("");

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const token = localStorage.getItem("token");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ====================================
  // LOAD
  // ====================================

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/expenses`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setExpenses(res.data.expenses);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ====================================
  // CREATE
  // ====================================

  const addExpense = async () => {
    try {
      await axios.post(
        `${API_URL}/expenses`,

        {
          title,
          category,
          amount,
          note,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Expense added successfully");

      setTitle("");
      setCategory("");
      setAmount("");
      setNote("");

      fetchExpenses();
    } catch (error) {
      console.log(error);
      toast.error("Failed to add expense");
    }
  };

  // ====================================
  // DELETE
  // ====================================

  const deleteExpense = async () => {
    try {
      await axios.delete(
        `${API_URL}/expenses/${selectedExpense._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Expense deleted successfully");

      setDeleteModal(false);
      setSelectedExpense(null);

      fetchExpenses();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  // ====================================
  // TOTAL
  // ====================================

  const totalExpense = expenses.reduce(
    (sum, exp) => sum + exp.amount,

    0,
  );
  const totalPages = Math.max(1, Math.ceil(expenses.length / pageSize));

  const pageExpenses = expenses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Expense Management</h1>

          <p style={styles.subtitle}>Track and manage business expenses</p>
        </div>
      </div>

      {/* FORM */}

      <div style={styles.formCard}>
        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Expense Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button style={styles.primaryBtn} onClick={addExpense}>
            + Add Expense
          </button>
        </div>
      </div>

      {/* TOTAL */}

      <div style={styles.totalCard}>
        <div style={styles.totalLabel}>Total Expense</div>

        <div style={styles.totalValue}>
          ₹ {totalExpense.toLocaleString("en-IN")}
        </div>
      </div>

      {/* TABLE */}

      <div style={styles.card} className="app-table-card">
        <table style={styles.table} className="app-table">
          <thead>
            <tr>
              <th>Title</th>

              <th>Category</th>

              <th>Amount</th>

              <th>Note</th>

              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {pageExpenses.map((exp) => (
              <tr key={exp._id} className="table-row">
                <td>{exp.title}</td>

                <td>{exp.category}</td>

                <td>₹ {exp.amount}</td>

                <td>{exp.note}</td>

                <td>
                  <button
                    className="app-action-btn app-action-delete"
                    style={styles.iconBtn}
                    title="Delete expense"
                    aria-label="Delete expense"
                    onClick={() => {
                      setSelectedExpense(exp);
                      setDeleteModal(true);
                    }}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {expenses.length > 0 && (
        <div style={styles.pagination}>
          {currentPage > 1 && (
            <button
              style={styles.pageBtn}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
          )}

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;

            return (
              <button
                key={page}
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
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          )}
        </div>
      )}

      {expenses.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>💸</div>

          <h3>No Expenses Found</h3>

          <p>No expense records available.</p>
        </div>
      )}

      {deleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>🗑️</div>

            <h2>Delete Expense?</h2>

            <p style={styles.modalText}>
              Are you sure you want to delete
              <strong> {selectedExpense?.title}</strong>?
            </p>

            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setDeleteModal(false);
                  setSelectedExpense(null);
                }}
              >
                Cancel
              </button>

              <button style={styles.confirmDeleteBtn} onClick={deleteExpense}>
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

  formCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: 20,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    gap: 12,
  },

  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 14,
  },

  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },

  totalCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  totalLabel: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
  },

  totalValue: {
    fontSize: 32,
    fontWeight: 800,
    color: "#0f172a",
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

  empty: {
    padding: 50,
    textAlign: "center",
    color: "#64748b",
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },

  iconBtn: {
    padding: 0,
    fontWeight: 700,
    fontSize: 14,
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
  pagination: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
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
