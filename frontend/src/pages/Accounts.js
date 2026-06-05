import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../config/api";
import { hasPermission } from "../utils/permissions";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [account_name, setAccountName] = useState("");
  const [account_type, setAccountType] = useState("CASH");
  const [balance, setBalance] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 10;

  const token = localStorage.getItem("token");

  // ====================================
  // LOAD
  // ====================================

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAccounts(res.data.accounts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // ====================================
  // CREATE
  // ====================================

  const createAccount = async () => {
    try {
      await axios.post(
        `${API_URL}/accounts`,
        {
          account_name,
          account_type,
          balance,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Account created successfully");

      setAccountName("");
      setAccountType("CASH");
      setBalance("");

      setCurrentPage(1);
      fetchAccounts();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create account");
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete(`${API_URL}/accounts/${selectedAccount._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Account deleted successfully");

      setDeleteModal(false);
      setSelectedAccount(null);

      setCurrentPage(1);
      fetchAccounts();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Delete failed");
      setDeleteModal(false);
    }
  };

  // ====================================
  // TOTALS
  // ====================================

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance || 0),
    0,
  );
  const totalPages = Math.max(1, Math.ceil(accounts.length / pageSize));

  const pageAccounts = accounts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  if (loading) {
    return <div style={styles.loading}>Loading accounts...</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Account Management</h1>
          <p style={styles.subtitle}>Manage bank and cash accounts</p>
        </div>
      </div>

      {/* FORM */}

      {hasPermission("CREATE_ACCOUNT") && (
        <div style={styles.formCard}>
          <div style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Account Name"
              value={account_name}
              onChange={(e) => setAccountName(e.target.value)}
            />

            <select
              style={styles.input}
              value={account_type}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="CASH">CASH</option>
              <option value="BANK">BANK</option>
            </select>

            <input
              style={styles.input}
              type="number"
              placeholder="Opening Balance"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />

            <button style={styles.primaryBtn} onClick={createAccount}>
              + Create Account
            </button>
          </div>
        </div>
      )}

      {/* TOTAL CARD */}

      <div style={styles.totalCard}>
        <div style={styles.totalLabel}>Total Balance</div>

        <div style={styles.totalValue}>
          ₹ {totalBalance.toLocaleString("en-IN")}
        </div>
      </div>

      {/* TABLE */}

      <div style={styles.card} className="app-table-card">
        <table style={styles.table} className="app-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Type</th>
              <th>Balance</th>
              <th style={{ width: "100px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {pageAccounts.map((acc) => (
              <tr key={acc._id} className="table-row">
                <td>{acc.account_name}</td>

                <td>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        acc.account_type === "BANK" ? "#2563eb" : "#16a34a",
                    }}
                  >
                    {acc.account_type}
                  </span>
                </td>

                <td>₹ {Number(acc.balance || 0).toLocaleString("en-IN")}</td>

                <td>
                  {hasPermission("DELETE_ACCOUNT") && (
                    <button
                      style={styles.iconBtn}
                      className="app-action-btn app-action-delete"
                      onClick={() => {
                        setSelectedAccount(acc);
                        setDeleteModal(true);
                      }}
                    >
                      🗑
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {accounts.length > 0 && (
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
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          )}
        </div>
      )}

      {/* Pagination */}

      {deleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>🗑️</div>

            <h2>Delete Account?</h2>

            <p style={styles.modalText}>
              Are you sure you want to delete
              <strong> {selectedAccount?.account_name}</strong>?
            </p>

            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setDeleteModal(false);
                  setSelectedAccount(null);
                }}
              >
                Cancel
              </button>

              <button style={styles.confirmDeleteBtn} onClick={deleteAccount}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {accounts.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🏦</div>

          <h3>No Accounts Found</h3>

          <p>No bank or cash accounts available.</p>
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
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
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
    fontSize: 14,
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

  badge: {
    color: "#fff",
    padding: "5px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
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
  th: {
    background: "#0f172a",
    color: "#fff",
    padding: "10px 12px",
    textAlign: "left",
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #eee",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  loading: {
    padding: 50,
    textAlign: "center",
    fontSize: 18,
  },
};
