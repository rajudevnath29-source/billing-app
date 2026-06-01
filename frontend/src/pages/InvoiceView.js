import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";
import { toWords } from "number-to-words";

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
  const [deleteModal, setDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / PAGE_SIZE),
  );
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

  const deleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      await axios.delete(
        `${API_URL}/invoices/${invoiceToDelete._id}`,
        authHeader,
      );

      toast.success("Invoice deleted successfully");

      setDeleteModal(false);
      setInvoiceToDelete(null);
      setSelectedInvoice(null);

      fetchInvoices();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invoice delete failed");
    }
  };

  const printInvoice = () => {
    const printContents = printRef.current.innerHTML;

    const win = window.open("", "", "width=900,height=650");

    win.document.write(`
    <html>
      <head>
        <title>Invoice</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            width: 210mm;
            min-height: 0;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          body{
            margin:0;
            padding:0;
            font-family:Arial;
          }
          * {
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
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
    if (!printRef.current || !selectedInvoice) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 210;
      const pageHeight = 297;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, Math.min(height, pageHeight));
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

  const getInvoiceDate = (invoice) =>
    invoice?.invoiceDate || invoice?.createdAt;

  const formatInvoiceDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  const billTotalQty = (selectedInvoice?.items || []).reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );

  const invoiceDueDate = selectedInvoice
    ? new Date(getInvoiceDate(selectedInvoice))
    : null;
  if (invoiceDueDate) {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 7);
  }

  const amountInWords = selectedInvoice
    ? `${toWords(Math.round(Number(selectedInvoice.grand_total || 0)))
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
        .replace(/,/g, "")} Rupees`
    : "";

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
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/invoice")}
          >
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

      <div style={styles.listCard} className="app-table-card">
        <table style={styles.table} className="app-table">
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
                <tr
                  key={invoice._id}
                  style={styles.tableRow}
                  className="table-row"
                >
                  <td style={styles.td}>
                    <b>{invoice.invoice_number}</b>
                  </td>
                  <td style={styles.td}>
                    {invoice.customer_name}
                    <p style={styles.muted}>{invoice.customer_mobile || "-"}</p>
                  </td>
                  <td style={styles.td}>
                    {formatDate(getInvoiceDate(invoice))}
                  </td>
                  <td style={styles.td}>{totalQty}</td>
                  <td style={styles.td}>
                    <span className="money-text">
                      ₹ {formatMoney(invoice.grand_total)}
                    </span>
                  </td>
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
                      {hasPermission("VIEW_INVOICE") && (
                        <button
                          className="app-action-btn app-action-view"
                          style={styles.iconBtn}
                          title="View invoice"
                          aria-label="View invoice"
                          onClick={() => openInvoice(invoice)}
                        >
                          👁
                        </button>
                      )}

                      {hasPermission("EDIT_INVOICE") && (
                        <button
                          className="app-action-btn app-action-edit"
                          style={styles.iconBtn}
                          title="Edit invoice"
                          aria-label="Edit invoice"
                          onClick={() =>
                            navigate(`/invoice-edit/${invoice._id}`)
                          }
                        >
                          ✎
                        </button>
                      )}

                      {hasPermission("DELETE_INVOICE") && (
                        <button
                          className="app-action-btn app-action-delete"
                          style={styles.iconBtn}
                          title="Delete invoice"
                          aria-label="Delete invoice"
                          onClick={() => {
                            setInvoiceToDelete(invoice);
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

        {filteredInvoices.length === 0 && (
          <div style={styles.empty}>No invoices found</div>
        )}
      </div>

      {filteredInvoices.length > 0 && (
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

      {selectedInvoice && (
        <div style={styles.modalOverlay}>
          <div style={styles.invoiceModal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.detailTitle}>
                  {selectedInvoice.invoice_number}
                </h3>
                <p style={styles.muted}>
                  {selectedInvoice.customer_name} |{" "}
                  {formatDate(getInvoiceDate(selectedInvoice))}
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
                    onClick={() =>
                      navigate(`/invoice-edit/${selectedInvoice._id}`)
                    }
                  >
                    Edit
                  </button>
                )}
                {hasPermission("DELETE_INVOICE") && (
                  <button
                    className="app-action-btn app-action-delete"
                    style={styles.iconBtn}
                    title="Delete invoice"
                    aria-label="Delete invoice"
                    onClick={() => {
                      setInvoiceToDelete(selectedInvoice);
                      setDeleteModal(true);
                    }}
                  >
                    🗑
                  </button>
                )}
                <button style={styles.closeBtn} onClick={closeInvoice}>
                  X
                </button>
              </div>
            </div>

            <div
              ref={printRef}
              className="print-area"
              style={styles.invoiceBox}
            >
              <div style={styles.invoicePaper}>
                <div style={styles.companyHeader}>
                  <img
                    src="/Logo-Light.png"
                    alt="Raaj Computer Service"
                    style={styles.companyLogo}
                  />

                  <div style={styles.companySection}>
                    <h1 style={styles.companyName}>Raaj Computer Service</h1>

                    <p style={styles.companyText}>
                      Vigyan Nagar Kota 8824824473, Rajasthan,
                    </p>
                  </div>
                </div>

                <div style={styles.invoiceInfoBar}>
                  <div style={styles.invoiceInfoLeft}>
                    <b>Invoice No.:</b> {selectedInvoice.invoice_number}
                  </div>

                  <div style={styles.invoiceInfoCenter}>
                    <b>Invoice Date:</b>{" "}
                    {formatInvoiceDate(getInvoiceDate(selectedInvoice))}
                  </div>

                  <div style={styles.invoiceInfoRight}>
                    <b>Due Date:</b> {formatInvoiceDate(invoiceDueDate)}
                  </div>
                </div>

                <div style={styles.billSection}>
                  <h3 style={styles.billTitle}>BILL TO</h3>

                  <div style={styles.customerName}>
                    {selectedInvoice.customer_name}
                  </div>

                  <div>Mobile : {selectedInvoice.customer_mobile || "-"}</div>
                </div>

                <table style={styles.billTable}>
                  <thead>
                    <tr>
                      <th
                        style={{ ...styles.billTableHead, ...styles.itemCol }}
                      >
                        ITEMS
                      </th>
                      <th style={{ ...styles.billTableHead, ...styles.qtyCol }}>
                        QTY.
                      </th>
                      <th
                        style={{ ...styles.billTableHead, ...styles.moneyCol }}
                      >
                        RATE
                      </th>
                      <th
                        style={{ ...styles.billTableHead, ...styles.moneyCol }}
                      >
                        AMOUNT
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {(selectedInvoice.items || []).map((item, index) => (
                      <tr key={index}>
                        <td
                          style={{ ...styles.billTableCell, ...styles.itemCol }}
                        >
                          <div style={styles.itemName}>{item.item_name}</div>

                          {item.serial_number && (
                            <div style={styles.serialNumber}>
                              {item.serial_number}
                            </div>
                          )}
                        </td>

                        <td
                          style={{ ...styles.billTableCell, ...styles.qtyCol }}
                        >
                          {item.qty} PCS
                        </td>

                        <td
                          style={{
                            ...styles.billTableCell,
                            ...styles.moneyCol,
                          }}
                        >
                          {formatMoney(item.price)}
                        </td>

                        <td
                          style={{
                            ...styles.billTableCell,
                            ...styles.moneyCol,
                          }}
                        >
                          {formatMoney(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={styles.invoiceSpacer} />

                <div style={styles.subtotalBlock}>
                  <div style={styles.subtotalLine}>
                    <b>SUBTOTAL</b>
                    <b style={styles.subtotalQty}>{billTotalQty}</b>
                    <span />
                    <b style={styles.subtotalAmount}>
                      Rs {formatMoney(selectedInvoice.sub_total)}
                    </b>
                  </div>
                </div>

                <div style={styles.totalsWrap}>
                  <div style={styles.totalsTable}>
                    {Number(selectedInvoice.discount || 0) > 0 && (
                      <div style={styles.totalDetailRow}>
                        <span>Discount</span>
                        <span style={styles.amountValue}>
                          - Rs {formatMoney(selectedInvoice.discount)}
                        </span>
                      </div>
                    )}

                    {selectedInvoice.gst_enabled && (
                      <div style={styles.totalDetailRow}>
                        <span>GST ({selectedInvoice.gst_rate}%)</span>
                        <span style={styles.amountValue}>
                          Rs {formatMoney(selectedInvoice.gst_amount)}
                        </span>
                      </div>
                    )}

                    <div style={styles.totalDetailRowStrong}>
                      <span>Total Amount</span>
                      <span style={styles.amountValue}>
                        Rs {formatMoney(selectedInvoice.grand_total)}
                      </span>
                    </div>

                    <div style={styles.totalDetailRow}>
                      <span>Received Amount</span>
                      <span style={styles.amountValue}>
                        Rs {formatMoney(selectedInvoice.paid_amount)}
                      </span>
                    </div>

                    {Number(selectedInvoice.due_amount || 0) > 0 && (
                      <div style={styles.totalDetailRow}>
                        <span>Due Amount</span>
                        <span style={styles.amountValue}>
                          Rs {formatMoney(selectedInvoice.due_amount)}
                        </span>
                      </div>
                    )}

                    <div style={styles.wordsSection}>
                      <strong>Total Amount (in words)</strong>
                      <p>{amountInWords}</p>
                    </div>
                  </div>
                </div>

                <div style={styles.footerNote}>Thank you. Visit again.</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.deleteModal}>
            <div style={styles.deleteModalIcon}>🗑️</div>

            <h2>Delete Invoice?</h2>

            <p style={styles.deleteModalText}>
              Are you sure you want to delete invoice
              <strong> {invoiceToDelete?.invoice_number}</strong>?
            </p>

            <div style={styles.deleteModalActions}>
              <button
                style={styles.cancelDeleteBtn}
                onClick={() => {
                  setDeleteModal(false);
                  setInvoiceToDelete(null);
                }}
              >
                Cancel
              </button>

              <button style={styles.confirmDeleteBtn} onClick={deleteInvoice}>
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
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
    padding: "10px 12px",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
  },
  td: {
    padding: "8px 12px",
    borderTop: "1px solid #eee",
    verticalAlign: "middle",
  },
  muted: {
    margin: "2px 0 0",
    color: "#64748b",
    fontSize: 12,
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 8px",
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
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  iconBtn: {
    padding: 0,
    fontWeight: 700,
    fontSize: 14,
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
    height: 32,
    padding: "0 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
  },
  editBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "0px 12px",
    borderRadius: 10,
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
  pageInfo: {
    color: "#475569",
    fontWeight: 700,
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
  activePageBtn: {
    background: "#2563eb",
    color: "#fff",
    cursor: "not-allowed",
    opacity: 0.8,
  },

  invoiceModal: {
    width: "910px",
    maxWidth: "96vw",
    maxHeight: "94vh",
    background: "#fff",
    borderRadius: 8,
    overflow: "auto",
  },

  invoiceBox: {
    padding: "0",
    background: "#e6e6e6",
  },

  invoicePaper: {
    width: "794px",
    minHeight: "auto",
    background: "#fff",
    padding: "30px 40px 28px",
    boxSizing: "border-box",
    margin: "0 auto",
    color: "#000",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "13px",
    lineHeight: 1.28,
  },

  companyHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "28px",
    marginBottom: "46px",
  },

  companyLogo: {
    width: "120px",
    height: "56px",
    objectFit: "contain",
    objectPosition: "left center",
  },

  companySection: {
    flex: 1,
  },

  companyName: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    color: "#000",
    letterSpacing: 0,
  },

  companyText: {
    margin: "6px 0 0",
    fontSize: "13px",
    fontWeight: 600,
  },

  invoiceInfoBar: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    alignItems: "center",
    background: "#e8e8e8",
    borderTop: "8px solid #000",
    boxSizing: "border-box",
    padding: "14px 17px 17px",
    marginBottom: "7px",
    fontSize: "13px",
  },

  invoiceInfoLeft: {
    textAlign: "left",
  },

  invoiceInfoCenter: {
    textAlign: "center",
  },

  invoiceInfoRight: {
    textAlign: "right",
  },

  billSection: {
    marginBottom: "15px",
    fontSize: "13px",
  },

  billTitle: {
    margin: "0 0 7px",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.2px",
  },

  customerName: {
    fontWeight: 800,
    fontSize: "14px",
    marginBottom: "5px",
  },

  billTable: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },

  billTableHead: {
    textAlign: "left",
    padding: "11px 10px 12px",
    borderTop: "2px solid #000",
    borderBottom: "3px solid #000",
    fontWeight: 800,
    fontSize: "14px",
  },

  billTableCell: {
    padding: "8px 10px 9px",
    borderBottom: "1px solid #d6d6d6",
    verticalAlign: "top",
    fontSize: "13px",
  },

  itemCol: {
    width: "64%",
  },

  qtyCol: {
    width: "12%",
    textAlign: "center",
  },

  moneyCol: {
    width: "12%",
    textAlign: "right",
  },

  itemName: {
    fontWeight: 700,
    textTransform: "uppercase",
  },

  serialNumber: {
    marginTop: "2px",
    fontSize: "10px",
    color: "#000",
  },

  invoiceSpacer: {
    height: "110px",
  },

  subtotalBlock: {
    borderTop: "3px solid #000",
    borderBottom: "3px solid #000",
    padding: "0 8px",
    fontSize: "13px",
  },

  subtotalLine: {
    display: "grid",
    gridTemplateColumns: "64% 12% 12% 12%",
    alignItems: "center",
    padding: "8px 0 9px",
  },

  subtotalQty: {
    textAlign: "center",
  },

  subtotalAmount: {
    textAlign: "right",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: 700,
  },

  totalsWrap: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "12px",
  },

  totalsTable: {
    width: "252px",
    fontSize: "13px",
  },

  totalDetailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    padding: "7px 0",
    borderTop: "1px solid #8a8a8a",
  },

  totalDetailRowStrong: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    padding: "7px 0",
    borderTop: "1px solid #8a8a8a",
    fontWeight: 800,
  },

  amountValue: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: 700,
    color: "#000",
    whiteSpace: "nowrap",
  },

  wordsSection: {
    marginTop: "20px",
    textAlign: "right",
    fontSize: "13px",
  },

  footerNote: {
    textAlign: "center",
    marginTop: "28px",
    color: "#000",
    fontSize: "13px",
    fontWeight: 600,
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
