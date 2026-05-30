import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";

const API_URL = "http://localhost:5000/api";
const PAGE_SIZE = 10;

export default function InvoiceView() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const authHeader = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/invoices`, authHeader);
      setInvoices(res.data.invoices || []);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        invoice.invoice_number?.toLowerCase().includes(keyword) ||
        invoice.customer_name?.toLowerCase().includes(keyword) ||
        invoice.customer_mobile?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || invoice.payment_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));
  const pageInvoices = filteredInvoices.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const openInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const closeInvoice = () => {
    setSelectedInvoice(null);
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadPDF = async () => {
    if (!printRef.current || !selectedInvoice) return;

    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 210;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`${selectedInvoice.invoice_number}.pdf`);
    } catch (error) {
      toast.error("PDF download failed");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle = (status) => {
    if (status === "PAID") return styles.paidBadge;
    if (status === "PARTIAL") return styles.partialBadge;
    return styles.dueBadge;
  };

  if (loading) {
    return <div style={styles.loading}>Loading invoices...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Invoice Management</h1>
          <p style={styles.subtitle}>Search, view, print and edit invoices</p>
        </div>

        {hasPermission("CREATE_INVOICE") && (
          <button style={styles.primaryBtn} onClick={() => navigate("/invoice")}>
            Create Invoice
          </button>
        )}
      </div>

      <div style={styles.filters}>
        <input
          placeholder="Search invoice, customer or mobile..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={styles.search}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={styles.select}
        >
          <option value="ALL">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="DUE">Due</option>
        </select>
      </div>

      <div style={styles.listCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Invoice</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {pageInvoices.map((invoice) => {
              const totalQty = (invoice.items || []).reduce(
                (sum, item) => sum + Number(item.qty || 0),
                0,
              );

              return (
                <tr key={invoice._id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <b>{invoice.invoice_number}</b>
                  </td>
                  <td style={styles.td}>
                    {invoice.customer_name}
                    <p style={styles.muted}>{invoice.customer_mobile || "-"}</p>
                  </td>
                  <td style={styles.td}>{formatDate(invoice.createdAt)}</td>
                  <td style={styles.td}>{totalQty}</td>
                  <td style={styles.td}>Rs {invoice.grand_total}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...statusStyle(invoice.payment_status),
                      }}
                    >
                      {invoice.payment_status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionWrap}>
                      <button
                        style={styles.secondaryBtn}
                        onClick={() => openInvoice(invoice)}
                      >
                        View
                      </button>

                      {hasPermission("EDIT_INVOICE") && (
                        <button
                          style={styles.editBtn}
                          onClick={() => navigate(`/invoice-edit/${invoice._id}`)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div style={styles.empty}>No invoices found</div>
        )}
      </div>

      {filteredInvoices.length > 0 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Prev
          </button>

          <span style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            style={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          >
            Next
          </button>
        </div>
      )}

      {selectedInvoice && (
        <div style={styles.modalOverlay}>
          <div style={styles.invoiceModal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.detailTitle}>{selectedInvoice.invoice_number}</h3>
                <p style={styles.muted}>
                  {selectedInvoice.customer_name} | {formatDate(selectedInvoice.createdAt)}
                </p>
              </div>

              <div style={styles.actionWrap}>
                {hasPermission("PRINT_INVOICE") && (
                  <button style={styles.secondaryBtn} onClick={printInvoice}>
                    Print
                  </button>
                )}

                {hasPermission("DOWNLOAD_INVOICE_PDF") && (
                  <button style={styles.secondaryBtn} onClick={downloadPDF}>
                    PDF
                  </button>
                )}

                {hasPermission("EDIT_INVOICE") && (
                  <button
                    style={styles.editBtn}
                    onClick={() => navigate(`/invoice-edit/${selectedInvoice._id}`)}
                  >
                    Edit
                  </button>
                )}

                <button style={styles.closeBtn} onClick={closeInvoice}>
                  Close
                </button>
              </div>
            </div>

            <div ref={printRef} style={styles.invoiceBox}>
              <div style={styles.invoiceHeader}>
                <div>
                  <h2 style={styles.printTitle}>INVOICE</h2>
                  <p style={styles.muted}>Invoice No: {selectedInvoice.invoice_number}</p>
                </div>

                <span
                  style={{
                    ...styles.statusBadge,
                    ...statusStyle(selectedInvoice.payment_status),
                  }}
                >
                  {selectedInvoice.payment_status}
                </span>
              </div>

              <div style={styles.infoGrid}>
                <div>
                  <span style={styles.label}>Customer</span>
                  <b>{selectedInvoice.customer_name}</b>
                </div>
                <div>
                  <span style={styles.label}>Mobile</span>
                  <b>{selectedInvoice.customer_mobile || "-"}</b>
                </div>
                <div>
                  <span style={styles.label}>Date</span>
                  <b>{formatDate(selectedInvoice.createdAt)}</b>
                </div>
              </div>

              <table style={styles.invoiceTable}>
                <thead>
                  <tr>
                    <th style={styles.invoiceTh}>Item</th>
                    <th style={styles.invoiceTh}>Qty</th>
                    <th style={styles.invoiceTh}>Price</th>
                    <th style={styles.invoiceTh}>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {(selectedInvoice.items || []).map((item, index) => (
                    <tr key={`${item.item_id}-${index}`}>
                      <td style={styles.invoiceTd}>
                        {item.item_name}
                        {item.serial_number && (
                          <p style={styles.itemNote}>{item.serial_number}</p>
                        )}
                      </td>
                      <td style={styles.invoiceTd}>{item.qty}</td>
                      <td style={styles.invoiceTd}>Rs {item.price}</td>
                      <td style={styles.invoiceTd}>Rs {item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.summaryBox}>
                <SummaryLine label="Subtotal" value={selectedInvoice.sub_total} />
                <SummaryLine label="Discount" value={selectedInvoice.discount} />
                {selectedInvoice.gst_enabled && (
                  <SummaryLine
                    label={`GST (${selectedInvoice.gst_rate}%)`}
                    value={selectedInvoice.gst_amount}
                  />
                )}
                <div style={styles.grandLine}>
                  <span>Grand Total</span>
                  <b>Rs {selectedInvoice.grand_total}</b>
                </div>
                <SummaryLine label="Paid" value={selectedInvoice.paid_amount} />
                <SummaryLine label="Due" value={selectedInvoice.due_amount} />
              </div>

              <p style={styles.thanks}>Thank you. Visit again.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div style={styles.summaryLine}>
      <span>{label}</span>
      <b>Rs {Number(value || 0).toFixed(2)}</b>
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
  filters: {
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
  listCard: {
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableRow: {
    background: "#fff",
  },
  th: {
    textAlign: "left",
    padding: 16,
    background: "#f8fafc",
    color: "#334155",
    fontWeight: 700,
    fontSize: 13,
  },
  td: {
    padding: 16,
    borderTop: "1px solid #f1f5f9",
    verticalAlign: "top",
  },
  muted: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 13,
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  paidBadge: {
    background: "#dcfce7",
    color: "#15803d",
  },
  partialBadge: {
    background: "#fef3c7",
    color: "#b45309",
  },
  dueBadge: {
    background: "#fee2e2",
    color: "#dc2626",
  },
  actionWrap: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryBtn: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    padding: "9px 13px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  editBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "9px 13px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  closeBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "9px 13px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  pageInfo: {
    color: "#475569",
    fontWeight: 700,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: 20,
  },
  invoiceModal: {
    width: "min(980px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 24px 70px rgba(15,23,42,0.25)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: 18,
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  detailTitle: {
    margin: 0,
    color: "#0f172a",
  },
  invoiceBox: {
    padding: 22,
    background: "#fff",
  },
  invoiceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  printTitle: {
    margin: 0,
    color: "#0f172a",
    letterSpacing: 0,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    background: "#f8fafc",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    display: "block",
    color: "#64748b",
    fontSize: 12,
    marginBottom: 5,
  },
  invoiceTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 20,
  },
  invoiceTh: {
    textAlign: "left",
    background: "#0f172a",
    color: "#fff",
    padding: 12,
  },
  invoiceTd: {
    padding: 12,
    borderBottom: "1px solid #e2e8f0",
  },
  itemNote: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 12,
  },
  summaryBox: {
    width: 300,
    marginLeft: "auto",
    background: "#f8fafc",
    borderRadius: 14,
    padding: 16,
  },
  summaryLine: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    color: "#475569",
  },
  grandLine: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #cbd5e1",
    borderBottom: "1px solid #cbd5e1",
    margin: "8px 0",
    padding: "10px 0",
    color: "#0f172a",
    fontSize: 18,
  },
  thanks: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 28,
  },
  empty: {
    padding: 45,
    textAlign: "center",
    color: "#64748b",
  },
};
