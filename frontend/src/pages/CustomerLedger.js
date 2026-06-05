import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";

export default function CustomerLedger() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [loading, setLoading] = useState(true);

  const LEDGER_PAGE_SIZE = 10;

  const [ledgerPage, setLedgerPage] = useState(1);

  const token = localStorage.getItem("token");

  const authHeader = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/customers/with-sales`,
        authHeader,
      );
      setCustomers(res.data.customers || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openLedger = async (customer) => {
    try {
      setSelectedCustomer(customer);
      setLedgerPage(1);
      setLoadingLedger(true);

      const res = await axios.get(
        `${API_URL}/invoices/customer/${customer._id}`,
        authHeader,
      );

      setCustomerInvoices(res.data.invoices || []);
    } catch (error) {
      console.log(error);
      setCustomerInvoices([]);
    } finally {
      setLoadingLedger(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.toLowerCase();

    return (
      customer.customer_name?.toLowerCase().includes(keyword) ||
      customer.phone?.toLowerCase().includes(keyword) ||
      customer.city?.toLowerCase().includes(keyword)
    );
  });

  const totalSales = customerInvoices.reduce(
    (sum, inv) => sum + Number(inv.grand_total || 0),
    0,
  );

  const totalPaid = customerInvoices.reduce(
    (sum, inv) => sum + Number(inv.paid_amount || 0),
    0,
  );

  const totalDue = customerInvoices.reduce(
    (sum, inv) => sum + Number(inv.due_amount || 0),
    0,
  );

  const ledgerTotalPages = Math.max(
    1,
    Math.ceil(customerInvoices.length / LEDGER_PAGE_SIZE),
  );

  const paginatedInvoices = customerInvoices.slice(
    (ledgerPage - 1) * LEDGER_PAGE_SIZE,
    ledgerPage * LEDGER_PAGE_SIZE,
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
  if (loading) {
    return <div style={styles.loading}>Loading customers...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Customer Ledger</h1>
          <p style={styles.subtitle}>
            Customer-wise sales, paid amount and balance
          </p>
        </div>
      </div>

      <div style={styles.mainBox}>
        <aside style={styles.leftBox}>
          <input
            placeholder="Search customer..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={styles.search}
          />

          <div style={styles.customerList}>
            {filteredCustomers.map((customer) => {
              const isActive = selectedCustomer?._id === customer._id;

              return (
                <button
                  key={customer._id}
                  type="button"
                  style={{
                    ...styles.customerCard,
                    ...(isActive ? styles.activeCustomerCard : {}),
                  }}
                  onClick={() => openLedger(customer)}
                >
                  <span style={styles.customerName}>
                    {customer.customer_name}
                  </span>
                  <span style={styles.customerMeta}>
                    {customer.phone || "-"}{" "}
                    {customer.city ? `• ${customer.city}` : ""}
                  </span>
                  <span className="money-text" style={styles.customerMoney}>
                    ₹ {formatMoney(customer.totalSales)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section style={styles.rightBox}>
          {selectedCustomer ? (
            <>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Customer</span>
                  <strong style={styles.summaryValue}>
                    {selectedCustomer.customer_name}
                  </strong>
                  <span style={styles.summaryNote}>
                    {selectedCustomer.phone || "-"}
                  </span>
                </div>

                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Total Sales</span>
                  <strong style={styles.summaryValue}>
                    ₹ {formatMoney(totalSales)}
                  </strong>
                </div>

                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Paid</span>
                  <strong style={styles.summaryValue}>
                    ₹ {formatMoney(totalPaid)}
                  </strong>
                </div>

                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Balance</span>
                  <strong style={styles.summaryValue}>
                    ₹ {formatMoney(totalDue)}
                  </strong>
                </div>
              </div>

              <div className="app-table-card" style={styles.tableCard}>
                <table className="app-table" style={styles.table}>
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedInvoices.map((invoice) => (
                      <tr key={invoice._id} className="table-row">
                        <td>
                          <strong>{invoice.invoice_number}</strong>
                        </td>
                        <td>
                          {formatDate(invoice.invoiceDate || invoice.createdAt)}
                        </td>
                        <td>
                          <span className="money-text">
                            ₹ {formatMoney(invoice.grand_total)}
                          </span>
                        </td>
                        <td>
                          <span className="money-text">
                            ₹ {formatMoney(invoice.paid_amount)}
                          </span>
                        </td>
                        <td>
                          <span className="money-text">
                            ₹ {formatMoney(invoice.due_amount)}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(invoice.payment_status === "PAID"
                                ? styles.paidBadge
                                : invoice.payment_status === "PARTIAL"
                                  ? styles.partialBadge
                                  : styles.dueBadge),
                            }}
                          >
                            {invoice.payment_status || "DUE"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {customerInvoices.length > 0 && (
                <div style={styles.pagination}>
                  {ledgerPage > 1 && (
                    <button
                      style={styles.pageBtn}
                      onClick={() => setLedgerPage((p) => p - 1)}
                    >
                      Prev
                    </button>
                  )}

                  {[...Array(ledgerTotalPages)].map((_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        key={page}
                        disabled={ledgerPage === page}
                        onClick={() => setLedgerPage(page)}
                        style={{
                          ...styles.pageBtn,
                          ...(ledgerPage === page ? styles.activePageBtn : {}),
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {ledgerPage < ledgerTotalPages && (
                    <button
                      style={styles.pageBtn}
                      onClick={() => setLedgerPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  )}
                </div>
              )}

              {loadingLedger && (
                <div style={styles.emptyBox}>Loading ledger...</div>
              )}

              {!loadingLedger && customerInvoices.length === 0 && (
                <div style={styles.emptyBox}>
                  No invoice found for this customer
                </div>
              )}
            </>
          ) : (
            <div style={styles.emptyState}>
              <h2 style={styles.emptyTitle}>Select Customer</h2>
              <p style={styles.subtitle}>
                Left side se customer choose karte hi uska ledger yahan dikh
                jayega.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 10,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 30,
    color: "#0f172a",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#64748b",
  },
  mainBox: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: 14,
    alignItems: "start",
  },
  leftBox: {
    background: "#fff",
    borderRadius: 10,
    padding: 8,
    height: "calc(100vh - 220px)",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  search: {
    width: "100%",
    boxSizing: "border-box",
    padding: 8,
    marginBottom: 6,
    borderRadius: 6,
    border: "1px solid #ccc",
    outline: "none",
  },
  customerList: {
    height: "calc(100% - 40px)",
    overflowY: "auto",
  },
  customerCard: {
    width: "100%",
    display: "grid",
    gap: 0,
    textAlign: "left",
    background: "#fff",
    border: "none",
    borderBottom: "1px solid #eee",
    gridTemplateColumns: "1fr auto",
    columnGap: 8,
    rowGap: 1,
    padding: "5px 7px",
    cursor: "pointer",
  },
  activeCustomerCard: {
    background: "#f1f5f9",
    borderLeft: "3px solid #2563eb",
  },
  customerName: {
    color: "#0f172a",
    fontWeight: 800,
    fontSize: 12,
    lineHeight: 1.2,
  },
  customerMeta: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 1.2,
  },
  customerMoney: {
    gridRow: "1 / span 2",
    gridColumn: 2,
    alignSelf: "center",
    fontSize: 12,
  },
  rightBox: {
    minWidth: 0,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr repeat(3, 1fr)",
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    background: "#fff",
    borderRadius: 10,
    padding: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  summaryValue: {
    display: "block",
    color: "#0f172a",
    fontSize: 17,
  },
  summaryNote: {
    display: "block",
    color: "#64748b",
    fontSize: 13,
    marginTop: 5,
  },
  tableCard: {
    borderRadius: 10,
  },
  table: {
    width: "100%",
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
  emptyBox: {
    padding: 40,
    textAlign: "center",
    color: "#64748b",
  },
  emptyState: {
    background: "#fff",
    padding: 50,
    borderRadius: 10,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  emptyTitle: {
    margin: 0,
    color: "#0f172a",
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
  loading: {
    padding: 50,
    textAlign: "center",
    fontSize: 18,
  },
};
