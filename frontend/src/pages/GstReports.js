import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../config/api";

export default function GstReports() {
  const token = localStorage.getItem("token");

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    fetchInvoices();
  }, [selectedMonth]);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allInvoices = res.data.invoices || [];
      
      const filteredInvoices = allInvoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.invoiceDate || invoice.createdAt);
        const invoiceMonth = invoiceDate.toISOString().slice(0, 7);
        return invoiceMonth === selectedMonth;
      });

      setInvoices(filteredInvoices);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load invoices");
      setLoading(false);
    }
  };

  const calculateGSTR1 = () => {
    let taxableValue = 0;
    let igstAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let totalTax = 0;
    let totalInvoiceValue = 0;

    invoices.forEach((invoice) => {
      if (invoice.gst_enabled) {
        taxableValue += invoice.sub_total - (invoice.discount || 0);
        igstAmount += invoice.igst_amount || 0;
        cgstAmount += invoice.cgst_amount || 0;
        sgstAmount += invoice.sgst_amount || 0;
        totalTax += invoice.gst_amount || 0;
      }
      totalInvoiceValue += invoice.grand_total || 0;
    });

    return {
      taxableValue,
      igstAmount,
      cgstAmount,
      sgstAmount,
      totalTax,
      totalInvoiceValue,
      invoiceCount: invoices.length,
    };
  };

  const gstr1Data = calculateGSTR1();

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
      maximumFractionDigits: 2,
    });

  if (loading) {
    return <div style={styles.loading}>Loading GST Reports...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>GST Reports</h1>
          <p style={styles.subtitle}>GSTR-1 format monthly reports</p>
        </div>
      </div>

      <div style={styles.filterCard}>
        <label style={styles.filterLabel}>
          Select Month:
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.monthInput}
          />
        </label>
      </div>

      <div style={styles.summaryCard}>
        <h3 style={styles.summaryTitle}>GSTR-1 Summary - {selectedMonth}</h3>
        
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Invoices</span>
            <span style={styles.summaryValue}>{gstr1Data.invoiceCount}</span>
          </div>
          
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Taxable Value</span>
            <span style={styles.summaryValue}>₹ {formatMoney(gstr1Data.taxableValue)}</span>
          </div>
          
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>IGST</span>
            <span style={styles.summaryValue}>₹ {formatMoney(gstr1Data.igstAmount)}</span>
          </div>
          
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>CGST</span>
            <span style={styles.summaryValue}>₹ {formatMoney(gstr1Data.cgstAmount)}</span>
          </div>
          
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>SGST</span>
            <span style={styles.summaryValue}>₹ {formatMoney(gstr1Data.sgstAmount)}</span>
          </div>
          
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Tax</span>
            <span style={styles.summaryValue}>₹ {formatMoney(gstr1Data.totalTax)}</span>
          </div>
          
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Invoice Value</span>
            <span style={styles.summaryValue}>₹ {formatMoney(gstr1Data.totalInvoiceValue)}</span>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Invoice Details</h3>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Invoice No</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Customer GSTIN</th>
              <th style={styles.th}>Taxable Value</th>
              <th style={styles.th}>IGST</th>
              <th style={styles.th}>CGST</th>
              <th style={styles.th}>SGST</th>
              <th style={styles.th}>Total Tax</th>
              <th style={styles.th}>Total Value</th>
              <th style={styles.th}>Type</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id}>
                <td style={styles.td}>{invoice.invoice_number}</td>
                <td style={styles.td}>{formatDate(invoice.invoiceDate)}</td>
                <td style={styles.td}>{invoice.customer_name}</td>
                <td style={styles.td}>-</td>
                <td style={styles.td}>
                  {invoice.gst_enabled 
                    ? formatMoney(invoice.sub_total - (invoice.discount || 0))
                    : "0.00"
                  }
                </td>
                <td style={styles.td}>
                  {formatMoney(invoice.igst_amount || 0)}
                </td>
                <td style={styles.td}>
                  {formatMoney(invoice.cgst_amount || 0)}
                </td>
                <td style={styles.td}>
                  {formatMoney(invoice.sgst_amount || 0)}
                </td>
                <td style={styles.td}>
                  {formatMoney(invoice.gst_amount || 0)}
                </td>
                <td style={styles.td}>
                  {formatMoney(invoice.grand_total)}
                </td>
                <td style={styles.td}>{invoice.gst_type}</td>
              </tr>
            ))}
            
            {invoices.length === 0 && (
              <tr>
                <td colSpan="11" style={styles.emptyTd}>
                  No invoices found for selected month
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
  filterCard: {
    background: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  filterLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#475569",
    fontWeight: 600,
  },
  monthInput: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    outline: "none",
  },
  summaryCard: {
    background: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  summaryTitle: {
    margin: "0 0 16px",
    fontSize: 18,
    color: "#0f172a",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  summaryItem: {
    background: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    textAlign: "center",
  },
  summaryLabel: {
    display: "block",
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
  },
  card: {
    background: "#fff",
    borderRadius: 10,
    padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    margin: "0 0 16px",
    fontSize: 18,
    color: "#0f172a",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    background: "#0f172a",
    padding: "10px 8px",
    textAlign: "left",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
  },
  td: {
    padding: "8px",
    borderTop: "1px solid #eee",
    fontSize: 13,
  },
  emptyTd: {
    padding: "30px",
    textAlign: "center",
    color: "#64748b",
  },
};
