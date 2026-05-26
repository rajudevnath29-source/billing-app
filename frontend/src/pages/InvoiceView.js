import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function InvoiceView() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const token = localStorage.getItem("token");
  const printRef = useRef();

  // FETCH ALL INVOICES
  const fetchInvoices = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/invoices",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setInvoices(res.data.invoices);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // OPEN INVOICE
  const openInvoice = (inv) => {
    setSelectedInvoice(inv);
  };

  // PRINT
  const printInvoice = () => {
    window.print();
  };

  // PDF DOWNLOAD
  const downloadPDF = () => {
    html2canvas(printRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const width = 210;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`${selectedInvoice.invoice_number}.pdf`);
    });
  };

  return (
    <Layout>

      <h2>🧾 Invoice List</h2>

      <div style={{ display: "flex", gap: 20 }}>

        {/* LEFT SIDE - LIST */}
        <div style={listBox}>
          {invoices.map((inv) => (
            <div
              key={inv._id}
              style={listItem}
              onClick={() => openInvoice(inv)}
            >
              <p><b>{inv.invoice_number}</b></p>
              <p>{inv.customer_name}</p>
              <p>₹ {inv.grand_total}</p>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE - INVOICE VIEW */}
        <div style={viewBox}>

          {selectedInvoice ? (
            <div>

              {/* ACTION BUTTONS */}
              <div style={{ marginBottom: 10 }}>
                <button onClick={printInvoice}>🖨️ Print</button>
                <button onClick={downloadPDF}>📄 PDF</button>
              </div>

              {/* INVOICE */}
              <div ref={printRef} style={invoiceBox}>

                <h2 style={{ textAlign: "center" }}>
                  🧾 INVOICE
                </h2>

                <hr />

                <p>
                  <b>Invoice No:</b>{" "}
                  {selectedInvoice.invoice_number}
                </p>

                <p>
                  <b>Customer:</b>{" "}
                  {selectedInvoice.customer_name}
                </p>

                <p>
                  <b>Mobile:</b>{" "}
                  {selectedInvoice.customer_mobile}
                </p>

                <hr />

                {/* ITEMS */}
                <table width="100%" border="1">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedInvoice.items.map((it, index) => (
                      <tr key={index}>
                        <td>{it.item_name}</td>
                        <td>{it.qty}</td>
                        <td>₹ {it.price}</td>
                        <td>₹ {it.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <hr />

                {/* TOTALS */}
                <p>
                  <b>Subtotal:</b> ₹ {selectedInvoice.sub_total}
                </p>

                <p>
                  <b>Discount:</b> ₹ {selectedInvoice.discount}
                </p>

                {/* GST (ONLY IF ENABLED) */}
                {selectedInvoice.gst_enabled && (
                  <>
                    <p>
                      <b>GST ({selectedInvoice.gst_rate}%):</b>{" "}
                      ₹ {selectedInvoice.gst_amount}
                    </p>
                  </>
                )}

                <h2 style={{ textAlign: "right" }}>
                  Grand Total: ₹ {selectedInvoice.grand_total}
                </h2>

                <hr />

                <p style={{ textAlign: "center" }}>
                  🙏 Thank You Visit Again
                </p>

              </div>
            </div>
          ) : (
            <h3>Select Invoice to View</h3>
          )}

        </div>
      </div>

    </Layout>
  );
}

/* STYLES */

const listBox = {
  width: "30%",
  border: "1px solid #ddd",
  padding: 10,
  height: "80vh",
  overflowY: "scroll"
};

const listItem = {
  padding: 10,
  borderBottom: "1px solid #eee",
  cursor: "pointer"
};

const viewBox = {
  width: "70%",
  padding: 10
};

const invoiceBox = {
  padding: 20,
  background: "#fff",
  border: "1px solid #ddd"
};