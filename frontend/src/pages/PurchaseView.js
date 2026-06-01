import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";

const PAGE_SIZE = 10;

export default function PurchaseView() {
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const printRef = useRef(null);

  const authHeader = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/purchases",
        authHeader,
      );
      setPurchases(res.data.purchases || []);
    } catch (error) {
      toast.error("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filteredPurchases = useMemo(() => {
    const keyword = search.toLowerCase();

    return purchases.filter(
      (purchase) =>
        purchase.purchase_number?.toLowerCase().includes(keyword) ||
        purchase.supplier_name?.toLowerCase().includes(keyword) ||
        purchase.supplier_mobile?.toLowerCase().includes(keyword),
    );
  }, [purchases, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPurchases.length / PAGE_SIZE),
  );
  const pagePurchases = filteredPurchases.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  const printPurchase = () => {
    const printContents = printRef.current.innerHTML;
    const win = window.open("", "", "width=900,height=650");

    win.document.write(`
      <html>
        <head>
          <title>Purchase</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial; background: #fff; }
            * { box-sizing: border-box; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background: #eef2f7; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);

    win.document.close();
    win.focus();

    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  const downloadPDF = async () => {
    if (!printRef.current || !selectedPurchase) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 210;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, Math.min(height, 297));
      pdf.save(`${selectedPurchase.purchase_number}.pdf`);
    } catch (error) {
      toast.error("PDF download failed");
    }
  };

  const openDeleteModal = (purchase) => {
    setPurchaseToDelete(purchase);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setPurchaseToDelete(null);
    setDeleteModal(false);
  };

  const deletePurchase = async () => {
    if (!purchaseToDelete) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/purchases/${purchaseToDelete._id}`,
        authHeader,
      );
      toast.success("Purchase deleted");
      setSelectedPurchase(null);
      closeDeleteModal();
      fetchPurchases();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Purchase delete failed");
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading purchases...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Purchase History</h1>
          <p style={styles.subtitle}>
            Search, view, print and export purchases
          </p>
        </div>
      </div>

      <div style={styles.filters}>
        <input
          placeholder="Search purchase, supplier or mobile..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={styles.search}
        />
      </div>

      <div className="app-table-card" style={styles.listCard}>
        <table className="app-table" style={styles.table}>
          <thead>
            <tr>
              <th>Purchase</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {pagePurchases.map((purchase) => {
              const totalQty = (purchase.items || []).reduce(
                (sum, item) => sum + Number(item.qty || 0),
                0,
              );

              return (
                <tr key={purchase._id} className="table-row">
                  <td>
                    <strong>{purchase.purchase_number}</strong>
                  </td>
                  <td>
                    {purchase.supplier_name}
                    <p style={styles.muted}>
                      {purchase.supplier_mobile || "-"}
                    </p>
                  </td>
                  <td>{formatDate(purchase.createdAt)}</td>
                  <td>{totalQty}</td>
                  <td>
                    <span className="money-text">
                      ₹ {formatMoney(purchase.grand_total)}
                    </span>
                  </td>
                  <td>
                    <div style={styles.actionWrap}>
                      <button
                        className="app-action-btn app-action-view"
                        style={styles.iconBtn}
                        title="View purchase"
                        aria-label="View purchase"
                        onClick={() => setSelectedPurchase(purchase)}
                      >
                        👁
                      </button>

                      {hasPermission("EDIT_PURCHASE") && (
                        <button
                          className="app-action-btn app-action-edit"
                          style={styles.iconBtn}
                          title="Edit purchase"
                          aria-label="Edit purchase"
                          onClick={() =>
                            navigate(`/purchase-edit/${purchase._id}`)
                          }
                        >
                          ✎
                        </button>
                      )}

                      {hasPermission("DELETE_PURCHASE") && (
                        <button
                          className="app-action-btn app-action-delete"
                          style={styles.iconBtn}
                          title="Delete purchase"
                          aria-label="Delete purchase"
                          onClick={() => openDeleteModal(purchase)}
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

        {filteredPurchases.length === 0 && (
          <div style={styles.empty}>No purchases found</div>
        )}
      </div>

      {filteredPurchases.length > 0 && (
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

      {selectedPurchase && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.detailTitle}>
                  {selectedPurchase.purchase_number}
                </h3>
                <p style={styles.muted}>
                  {selectedPurchase.supplier_name} |{" "}
                  {formatDate(selectedPurchase.createdAt)}
                </p>
              </div>

              <div style={styles.actionWrap}>
                {hasPermission("PRINT_PURCHASE") && (
                  <button style={styles.secondaryBtn} onClick={printPurchase}>
                    Print
                  </button>
                )}

                {hasPermission("DOWNLOAD_PURCHASE_PDF") && (
                  <button style={styles.secondaryBtn} onClick={downloadPDF}>
                    PDF
                  </button>
                )}
                {hasPermission("DELETE_PURCHASE") && (
                  <button
                    className="app-action-btn app-action-delete"
                    style={styles.iconBtn}
                    title="Delete purchase"
                    aria-label="Delete purchase"
                    onClick={() => openDeleteModal(selectedPurchase)}
                  >
                    🗑
                  </button>
                )}

                <button
                  style={styles.closeBtn}
                  onClick={() => setSelectedPurchase(null)}
                >
                  X
                </button>
              </div>
            </div>

            <div ref={printRef} style={styles.purchasePaper}>
              <div style={styles.paperHeader}>
                <h2 style={styles.paperTitle}>Purchase Details</h2>
                <div style={styles.paperMeta}>
                  <strong>{selectedPurchase.purchase_number}</strong>
                  <span>{formatDate(selectedPurchase.createdAt)}</span>
                </div>
              </div>

              <div style={styles.infoGrid}>
                <div>
                  <span style={styles.label}>Supplier</span>
                  <strong>{selectedPurchase.supplier_name}</strong>
                </div>
                <div>
                  <span style={styles.label}>Mobile</span>
                  <strong>{selectedPurchase.supplier_mobile || "-"}</strong>
                </div>
                <div>
                  <span style={styles.label}>Grand Total</span>
                  <strong>₹ {formatMoney(selectedPurchase.grand_total)}</strong>
                </div>
              </div>

              <table className="app-table" style={styles.detailTable}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedPurchase.items || []).map((item, index) => (
                    <tr key={index} className="table-row">
                      <td>{item.item_name}</td>
                      <td>{item.qty}</td>
                      <td>₹ {formatMoney(item.purchase_price)}</td>
                      <td>₹ {formatMoney(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.totalsBox}>
                <div style={styles.totalRow}>
                  <span>Subtotal</span>
                  <strong>₹ {formatMoney(selectedPurchase.sub_total)}</strong>
                </div>
                {selectedPurchase.gst_enabled && (
                  <div style={styles.totalRow}>
                    <span>GST ({selectedPurchase.gst_rate}%)</span>
                    <strong>
                      ₹ {formatMoney(selectedPurchase.gst_amount)}
                    </strong>
                  </div>
                )}
                <div style={styles.grandRow}>
                  <span>Grand Total</span>
                  <strong>₹ {formatMoney(selectedPurchase.grand_total)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.deleteModal}>
            <div style={styles.deleteModalIcon}>🗑️</div>
            <h2>Delete Purchase?</h2>
            <p style={styles.deleteModalText}>
              Are you sure you want to delete{" "}
              <strong>{purchaseToDelete?.purchase_number}</strong>?
            </p>

            <div style={styles.deleteModalActions}>
              <button style={styles.cancelDeleteBtn} onClick={closeDeleteModal}>
                Cancel
              </button>

              <button style={styles.confirmDeleteBtn} onClick={deletePurchase}>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
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
  filters: {
    display: "flex",
    gap: 15,
    marginBottom: 14,
  },
  search: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    outline: "none",
  },
  listCard: {
    borderRadius: 10,
  },
  table: {
    width: "100%",
  },
  muted: {
    margin: "2px 0 0",
    color: "#64748b",
    fontSize: 12,
  },
  actionWrap: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  iconBtn: {
    padding: 0,
    fontWeight: 700,
    fontSize: 14,
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
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    width: 900,
    maxWidth: "96vw",
    maxHeight: "94vh",
    background: "#fff",
    borderRadius: 8,
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: 14,
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  detailTitle: {
    margin: 0,
    color: "#0f172a",
  },
  secondaryBtn: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    height: 32,
    padding: "0 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
  },
  closeBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    height: 32,
    minWidth: 32,
    padding: "0 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
  },
  purchasePaper: {
    padding: 24,
    background: "#fff",
  },
  paperHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
  },
  paperTitle: {
    margin: 0,
    color: "#0f172a",
  },
  paperMeta: {
    display: "grid",
    gap: 4,
    textAlign: "right",
    color: "#0f172a",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    background: "#f8fafc",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  label: {
    display: "block",
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },
  detailTable: {
    marginBottom: 18,
  },
  totalsBox: {
    width: 280,
    marginLeft: "auto",
    background: "#f8fafc",
    borderRadius: 8,
    padding: 14,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    color: "#475569",
  },
  grandRow: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #cbd5e1",
    marginTop: 6,
    paddingTop: 10,
    color: "#0f172a",
    fontSize: 17,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
  },
  deleteModal: {
    background: "#fff",
    width: 420,
    padding: 30,
    borderRadius: 24,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },

  deleteModalIcon: {
    fontSize: 55,
    marginBottom: 10,
  },

  deleteModalText: {
    color: "#64748b",
    marginTop: 10,
    lineHeight: 1.7,
  },

  deleteModalActions: {
    display: "flex",
    gap: 15,
    marginTop: 25,
  },

  cancelDeleteBtn: {
    flex: 1,
    border: "none",
    padding: 12,
    borderRadius: 12,
    background: "#e2e8f0",
    cursor: "pointer",
    fontWeight: 600,
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
