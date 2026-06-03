import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_URL } from "../config/api";

export default function Payments() {
  const [invoices, setInvoices] = useState([]);

  const [payments, setPayments] = useState([]);

  const [selectedInvoice, setSelectedInvoice] = useState("");

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const token = localStorage.getItem("token");
  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ====================================
  // LOAD
  // ====================================

  const loadData = async () => {
    try {
      // DUE INVOICES

      const invoiceRes = await axios.get(
        `${API_URL}/invoices`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const dueInvoices = invoiceRes.data.invoices.filter(
        (inv) => inv.due_amount > 0,
      );

      setInvoices(dueInvoices);

      // PAYMENTS

      const paymentRes = await axios.get(
        `${API_URL}/payments`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPayments(paymentRes.data.payments);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ====================================
  // CREATE PAYMENT
  // ====================================

  const collectPayment = async () => {
    if (!selectedInvoice) {
      toast.error("Please select invoice");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    const invoiceData = invoices.find((i) => i._id === selectedInvoice);

    if (!invoiceData) {
      toast.error("Invoice not found");
      return;
    }

    if (Number(amount) > Number(invoiceData.due_amount)) {
      toast.error(`Amount cannot exceed Due Amount ₹${invoiceData.due_amount}`);
      return;
    }

    try {
      await axios.post(
        `${API_URL}/payments`,
        {
          customer: invoiceData.customer,
          invoice: invoiceData._id,
          amount,
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Payment collected successfully");

      setSelectedInvoice("");
      setAmount("");
      setNote("");

      loadData();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to collect payment",
      );
    }
  };

  const deletePayment = async () => {
    try {
      await axios.delete(
        `${API_URL}/payments/${selectedPayment._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Payment deleted successfully");

      setDeleteModal(false);

      setSelectedPayment(null);

      loadData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };
  const totalPages = Math.max(1, Math.ceil(payments.length / pageSize));

  const pagePayments = payments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Payment Collection</h1>
          <p style={styles.subtitle}>
            Collect customer payments and track history
          </p>
        </div>
      </div>

      <div style={styles.formCard}>
        <div style={styles.formGrid}>
          {/* FORM */}

          <select
            style={styles.input}
            value={selectedInvoice}
            onChange={(e) => setSelectedInvoice(e.target.value)}
          >
            <option value="">Select Invoice</option>

            {invoices.map((inv) => (
              <option key={inv._id} value={inv._id}>
                {inv.invoice_number} | {inv.customer_name}
                {" | Due ₹"}
                {Number(inv.due_amount).toLocaleString("en-IN")}
              </option>
            ))}
          </select>

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

          <button style={styles.primaryBtn} onClick={collectPayment}>
            + Collect Payment
          </button>
        </div>
      </div>

      {/* PAYMENT HISTORY */}
      <div style={styles.card}>
        <table style={styles.table} className="app-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pagePayments.map((pay) => (
              <tr key={pay._id} className="table-row">
                <td>{pay.invoice?.invoice_number}</td>
                <td>₹ {Number(pay.amount).toLocaleString("en-IN")}</td>
                <td>{new Date(pay.createdAt).toLocaleDateString("en-IN")}</td>
                <td>{pay.note || "-"}</td>
                <td>
                  <button
                    className="app-action-btn app-action-delete"
                    style={styles.iconBtn}
                    onClick={() => {
                      setSelectedPayment(pay);
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
        {deleteModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalIcon}>🗑️</div>

              <h2>Delete Payment?</h2>

              <p style={styles.modalText}>
                Are you sure you want to delete this payment?
              </p>

              <div style={styles.modalActions}>
                <button
                  style={styles.cancelBtn}
                  onClick={() => {
                    setDeleteModal(false);
                    setSelectedPayment(null);
                  }}
                >
                  Cancel
                </button>

                <button style={styles.confirmDeleteBtn} onClick={deletePayment}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {payments.length > 0 && (
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
      {payments.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>💰</div>

          <h3>No Payments Found</h3>

          <p>No payment records available.</p>
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
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: 20,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 2fr 1fr",
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
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
  },

  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
  },

  iconBtn: {
    padding: 0,
    fontWeight: 700,
    fontSize: 14,
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
  deleteBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
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

  activePageBtn: {
    background: "#2563eb",
    color: "#fff",
    cursor: "not-allowed",
    opacity: 0.8,
  },
};
