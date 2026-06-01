import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function Vouchers() {
  const [accounts, setAccounts] = useState([]);

  const [vouchers, setVouchers] = useState([]);

  const [voucher_type, setVoucherType] = useState("CREDIT");

  const [account, setAccount] = useState("");

  const [to_account, setToAccount] = useState("");

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const token = localStorage.getItem("token");

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  // ====================================
  // LOAD
  // ====================================

  const loadData = async () => {
    try {
      const accRes = await axios.get(
        "http://localhost:5000/api/accounts",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAccounts(accRes.data.accounts);

      const vouRes = await axios.get(
        "http://localhost:5000/api/vouchers",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setVouchers(vouRes.data.vouchers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ====================================
  // CREATE
  // ====================================

  const createVoucher = async () => {
    if (voucher_type === "TRANSFER" && account === to_account) {
      toast.error("From Account and To Account cannot be same");
      return;
    }

    try {
      const payload = {
        voucher_type,
        account,
        amount,
        note,
      };

      // sirf TRANSFER me bhejo
      if (voucher_type === "TRANSFER") {
        payload.to_account = to_account;
      }

      await axios.post("http://localhost:5000/api/vouchers", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Voucher added successfully");

      setAmount("");
      setNote("");
      setAccount("");
      setToAccount("");

      setCurrentPage(1);
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create voucher");
    }
  };

  const deleteVoucher = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/vouchers/${selectedVoucher._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Voucher deleted successfully");

      setDeleteModal(false);
      setSelectedVoucher(null);

      setCurrentPage(1);
      loadData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };
  const totalPages = Math.max(1, Math.ceil(vouchers.length / pageSize));

  const pageVouchers = vouchers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Voucher Management</h1>
          <p style={styles.subtitle}>
            Manage credit, debit and transfer vouchers
          </p>
        </div>
      </div>

      {/* FORM */}

      <div style={styles.formCard}>
        <div style={styles.formGrid}>
          <select
            style={styles.input}
            value={voucher_type}
            onChange={(e) => setVoucherType(e.target.value)}
          >
            <option value="CREDIT">CREDIT</option>

            <option value="DEBIT">DEBIT</option>

            <option value="TRANSFER">TRANSFER</option>
          </select>

          {/* ACCOUNT */}

          <select
            style={styles.input}
            value={account}
            onChange={(e) => {
              setAccount(e.target.value);
              setToAccount("");
            }}
          >
            <option value="">Select Account</option>

            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.account_name} - ₹{acc.balance}
              </option>
            ))}
          </select>

          {/* TRANSFER */}

          {voucher_type === "TRANSFER" && (
            <select
              style={styles.input}
              value={to_account}
              onChange={(e) => setToAccount(e.target.value)}
            >
              <option value="">To Account</option>

              {accounts
                .filter((acc) => acc._id !== account)
                .map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.account_name}
                  </option>
                ))}
            </select>
          )}

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

          <button style={styles.primaryBtn} onClick={createVoucher}>
            + Save Voucher
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div style={styles.card} className="app-table-card">
        <table style={styles.table} className="app-table">
          <thead>
            <tr>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Account</th>
              <th style={styles.th}>To</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Note</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {pageVouchers.map((vou) => (
              <tr key={vou._id} className="table-row">
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        vou.voucher_type === "CREDIT"
                          ? "#16a34a"
                          : vou.voucher_type === "DEBIT"
                            ? "#ef4444"
                            : "#2563eb",
                    }}
                  >
                    {vou.voucher_type}
                  </span>
                </td>

                <td style={styles.td}>{vou.account?.account_name}</td>

                <td style={styles.td}>{vou.to_account?.account_name || "-"}</td>

                <td style={styles.td}>
                  ₹ {Number(vou.amount).toLocaleString("en-IN")}
                </td>

                <td style={styles.td}>{vou.note}</td>

                <td style={styles.td}>
                  <button
                    className="app-action-btn app-action-delete"
                    style={styles.iconBtn}
                    onClick={() => {
                      setSelectedVoucher(vou);
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

      {vouchers.length > 0 && (
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

      {vouchers.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>💳</div>

          <h3>No Vouchers Found</h3>

          <p>No voucher entries available.</p>
        </div>
      )}

      {deleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>🗑️</div>

            <h2>Delete Voucher?</h2>

            <p style={styles.modalText}>
              Are you sure you want to delete this voucher?
            </p>

            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setDeleteModal(false);
                  setSelectedVoucher(null);
                }}
              >
                Cancel
              </button>

              <button style={styles.confirmDeleteBtn} onClick={deleteVoucher}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================================
   STYLES
==================================== */
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
    gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 2fr 1fr",
    gap: 12,
  },

  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 14,
    background: "#fff",
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
    color: "#fff",
    padding: "10px 12px",
    textAlign: "left",
  },

  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #eee",
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
};
