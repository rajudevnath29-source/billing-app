import { useState, useMemo } from "react";
import axios from "axios";
import Papa from "papaparse";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api";

export default function BulkInvoice() {
  const token = localStorage.getItem("token");

  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const [rowStatus, setRowStatus] = useState({});

  const authHeader = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token],
  );

  // =========================
  // HELPERS (ONLY LOGIC FIX)
  // =========================
  const safeString = (v) => (v ? String(v).trim() : "");
  const safeNumber = (v) => (v === "" || v == null ? 0 : Number(v));
  const safeBool = (v) => {
    const result = String(v).trim().toLowerCase() === "true";
    return result;
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";

    let [dd, mm, yy] = parts;
    if (yy.length === 2) yy = "20" + yy;

    return `${yy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  };

  // =========================
  // LOAD ITEMS
  // =========================
  const loadItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/items`, authHeader);
      setItems(res.data.items || []);
    } catch {
      toast.error("Failed to load items");
    }
  };

  // =========================
  // FILE UPLOAD
  // =========================
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setRows(res.data);

        const init = {};
        res.data.forEach((_, i) => (init[i] = "Pending"));
        setRowStatus(init);

        loadItems();

        toast.success(`${res.data.length} rows loaded`);
      },
    });
  };

  // =========================
  // RESET (NOT REMOVED ANYTHING)
  // =========================
  const resetAll = () => {
    setRows([]);
    setItems([]);
    setFileName("");
    setRowStatus({});

    // ✅ IMPORTANT: clear file input also
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
    toast.success("All data reset");
  };

  // =========================
  // SAMPLE CSV (UNCHANGED BUTTON)
  // =========================
  const downloadSample = () => {
    const csv = `customer_name,customer_mobile,invoiceDate,item_name,qty,price,discount,gst_enabled,paid_amount,serial_number
                  Rahul,9876543210,2026-06-02,Laptop,1,45000,0,true,0,
                  Rahul,9876543210,2026-06-02,Mouse,1,500,,true,0,
                  Cash,,2026-06-02,SSD 128GB,1,2250,100,,0,SN123`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_invoice_sample.csv";
    a.click();
  };

  // =========================
  // UPLOAD LOGIC (FIX ONLY)
  // =========================
  const uploadInvoices = async () => {
    if (!rows.length) return toast.error("Upload CSV first");

    setUploading(true);

    const grouped = {};

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(row.gst_enabled);
      console.log(safeBool(row.gst_enabled));
      const cleanRow = {
        customer_name: safeString(row.customer_name),
        customer_mobile: safeString(row.customer_mobile),
        invoiceDate: normalizeDate(row.invoiceDate),

        item_name: safeString(row.item_name),
        qty: safeNumber(row.qty),
        price: safeNumber(row.price),

        discount: safeNumber(row.discount),
        gst_enabled: safeBool(row.gst_enabled),
        paid_amount: safeNumber(row.paid_amount),

        serial_number: safeString(row.serial_number),
      };

      // REQUIRED VALIDATION
      if (
        !cleanRow.customer_name ||
        !cleanRow.item_name ||
        !cleanRow.qty ||
        !cleanRow.price
      ) {
        setRowStatus((p) => ({ ...p, [i]: "Invalid Row" }));
        toast.error(`Invalid row: ${cleanRow.item_name || "unknown"}`);
        continue;
      }

      const key = `${cleanRow.customer_name}_${cleanRow.customer_mobile}_${cleanRow.invoiceDate}`;

      const item = items.find(
        (it) =>
          it.item_name?.trim().toLowerCase() ===
          cleanRow.item_name.toLowerCase(),
      );

      if (!item) {
        setRowStatus((p) => ({ ...p, [i]: "Item Not Found" }));
        toast.error(`Item not found: ${cleanRow.item_name}`);
        continue;
      }

      if (!grouped[key]) {
        grouped[key] = {
          customer_name: cleanRow.customer_name,
          customer_mobile: cleanRow.customer_mobile,
          invoiceDate: normalizeDate(cleanRow.invoiceDate),

          discount: 0,
          gst_enabled: false,
          paid_amount: 0,

          items: [],
          rows: [],
        };
      }

      // 🔥 ADD THIS BELOW (IMPORTANT)
      grouped[key].discount = Math.max(
        grouped[key].discount,
        cleanRow.discount || 0,
      );

      grouped[key].gst_enabled =
        grouped[key].gst_enabled || cleanRow.gst_enabled;

      grouped[key].paid_amount = cleanRow.paid_amount || 0;

      grouped[key].items.push({
        item_id: item._id,
        item_name: item.item_name,
        qty: cleanRow.qty,
        price: cleanRow.price,
        serial_number: cleanRow.serial_number,
      });

      grouped[key].rows.push(i);
    }

    let success = 0;
    let failed = 0;

    for (const inv of Object.values(grouped)) {
      try {
        await axios.post(
          `${API_URL}/invoices`,
          { ...inv, isBulk: true },
          authHeader,
        );

        success++;

        inv.rows.forEach((i) =>
          setRowStatus((p) => ({ ...p, [i]: "Success" })),
        );
      } catch (err) {
        failed++;

        inv.rows.forEach((i) => setRowStatus((p) => ({ ...p, [i]: "Failed" })));

        toast.error(err?.response?.data?.message || "Invoice failed");
      }
    }

    setUploading(false);

    toast.success(`${success} success, ${failed} failed`);
  };

  // =========================
  // STATUS COLOR
  // =========================
  const getColor = (status) => {
    if (status === "Success") return "green";
    if (status === "Item Not Found") return "orange";
    if (status === "Invalid Row") return "red";
    return "#64748b";
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

      {/* UPLOAD CARD */}
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
          </div>

          <div style={styles.buttonGroup}>
            <button onClick={downloadSample} style={styles.sampleBtn}>
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
            {/* ✅ RESET BUTTON */}
            <button onClick={resetAll} style={styles.resetBtn}>
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* PREVIEW TABLE */}
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
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Item</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.customer_name}</td>
                    <td>{row.customer_mobile}</td>
                    <td>{row.invoiceDate}</td>
                    <td>{row.item_name}</td>
                    <td>{row.qty}</td>
                    <td>₹ {row.price}</td>

                    <td style={{ color: getColor(rowStatus[index]) }}>
                      {rowStatus[index] || "Pending"}
                    </td>
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

/* =============================
   STYLES (UNCHANGED)
============================= */
const styles = {
  page: { padding: 10 },

  topBar: {
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    color: "#0f172a",
    margin: 0,
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
    padding: "12px 18px",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
  },

  primaryBtn: {
    background: "#16a34a",
    color: "#fff",
    padding: "12px 18px",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
  },

  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
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
    padding: "12px 0",
    textAlign: "left", // ✅ important
    borderBottom: "1px solid #e2e8f0",
  },
  resetBtn: {
    background: "#ef4444",
    color: "#fff",
    padding: "12px 18px",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
  },
};
