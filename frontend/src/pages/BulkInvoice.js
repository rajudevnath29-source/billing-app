import { useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api";

export default function BulkInvoice() {
  const token = localStorage.getItem("token");

  const [rows, setRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (result) => {
        setRows(result.data);
        toast.success(`${result.data.length} rows loaded`);
      },

      error: () => {
        toast.error("Invalid CSV file");
      },
    });
  };

  const uploadInvoices = async () => {
    if (!rows.length) {
      toast.error("Please upload CSV first");
      return;
    }

    try {
      setUploading(true);

      const grouped = {};

      rows.forEach((row) => {
        const key = `${row.customer_name}_${row.customer_mobile}`;

        if (!grouped[key]) {
          grouped[key] = {
            customer_name: row.customer_name,
            customer_mobile: row.customer_mobile,
            items: [],
          };
        }

        grouped[key].items.push({
          item_name: row.item_name,
          qty: Number(row.qty),
          price: Number(row.price),
          total: Number(row.qty) * Number(row.price),
          serial_number: "",
        });
      });

      const invoices = Object.values(grouped);

      let success = 0;

      for (const invoice of invoices) {
        await axios.post(
          `${API_URL}/invoices`,
          {
            customer_name: invoice.customer_name,
            customer_mobile: invoice.customer_mobile,
            items: invoice.items,
            discount: 0,
            paid_amount: 0,
            gst_enabled: false,
            gst_rate: 0,
          },
          authHeader,
        );

        success++;
      }

      toast.success(`${success} invoices created successfully`);

      setRows([]);
      setFileName("");
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to create invoices",
      );
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `customer_name;customer_mobile;item_name;qty;price
Rohit Sharma;9999999999;Laptop;1;50000
Rohit Sharma;9999999999;Mouse;2;500
Amit Kumar;8888888888;Keyboard;1;1200
Amit Kumar;8888888888;Mouse;1;500`;

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "sample_invoice.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Bulk Invoice Upload</h1>

          <p style={styles.subtitle}>
            Upload CSV file and generate invoices automatically
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.uploadRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Select Invoice CSV</label>

            <input
              type="file"
              accept=".csv"
              onChange={handleFile}
              style={styles.input}
            />

            {fileName && <small style={styles.fileText}>{fileName}</small>}
          </div>

          <div style={styles.buttonGroup}>
            <button onClick={downloadSampleCSV} style={styles.sampleBtn}>
              📥 Sample CSV
            </button>

            <button
              onClick={uploadInvoices}
              disabled={uploading}
              style={{
                ...styles.primaryBtn,
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? "Creating..." : "Create Invoices"}
            </button>
          </div>
        </div>
      </div>

      {rows.length > 0 && (
        <div style={styles.card}>
          <div style={styles.previewHeader}>
            <h3 style={{ margin: 0 }}>Preview Data</h3>

            <span style={styles.badge}>{rows.length} Rows</span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer</th>

                  <th style={styles.th}>Mobile</th>

                  <th style={styles.th}>Item</th>

                  <th style={styles.th}>Qty</th>

                  <th style={styles.th}>Price</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{row.customer_name}</td>

                    <td style={styles.td}>{row.customer_mobile}</td>

                    <td style={styles.td}>{row.item_name}</td>

                    <td style={styles.td}>{row.qty}</td>

                    <td style={styles.td}>₹ {row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    marginBottom: 20,
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

  card: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    padding: 20,
    marginBottom: 20,
  },

  uploadRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 16,
    alignItems: "end",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
  },

  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    width: "100%",
    boxSizing: "border-box",
  },

  fileText: {
    marginTop: 8,
    color: "#64748b",
  },

  buttonGroup: {
    display: "flex",
    gap: 10,
  },

  sampleBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
  },

  primaryBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
  },

  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  badge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#f8fafc",
    padding: 12,
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #e2e8f0",
  },
};
