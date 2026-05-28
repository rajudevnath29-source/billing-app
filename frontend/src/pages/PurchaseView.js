import { useEffect, useState } from "react";
import axios from "axios";

export default function PurchaseView() {
  const [purchases, setPurchases] = useState([]);

  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const token = localStorage.getItem("token");

  // ====================================
  // FETCH PURCHASES
  // ====================================

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/purchases",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPurchases(res.data.purchases);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <div style={pageStyle}>
      <h1 style={heading}>📦 Purchase History</h1>

      <div style={mainBox}>
        {/* LEFT SIDE */}
        <div style={leftBox}>
          {purchases.map((purchase) => (
            <div
              key={purchase._id}
              style={purchaseCard}
              onClick={() => setSelectedPurchase(purchase)}
            >
              <h3>{purchase.purchase_number}</h3>

              <p>Supplier: {purchase.supplier_name}</p>

              <p>₹ {purchase.grand_total}</p>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div style={rightBox}>
          {selectedPurchase ? (
            <div style={detailsBox}>
              <h2>📄 Purchase Details</h2>

              <hr />

              <p>
                <b>Purchase No:</b> {selectedPurchase.purchase_number}
              </p>

              <p>
                <b>Supplier:</b> {selectedPurchase.supplier_name}
              </p>

              <p>
                <b>Mobile:</b> {selectedPurchase.supplier_mobile}
              </p>

              <hr />

              {/* ITEMS */}

              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th>Item</th>

                    <th>Qty</th>

                    <th>Price</th>

                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedPurchase.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item_name}</td>

                      <td>{item.qty}</td>

                      <td>₹ {item.purchase_price}</td>

                      <td>₹ {item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <hr />

              {/* TOTALS */}

              <p>
                <b>Subtotal:</b> ₹ {selectedPurchase.sub_total}
              </p>

              <p>
                <b>Discount:</b> ₹ {selectedPurchase.discount}
              </p>

              {selectedPurchase.gst_enabled && (
                <p>
                  <b>
                    GST ({selectedPurchase.gst_rate}
                    %):
                  </b>{" "}
                  ₹ {selectedPurchase.gst_amount}
                </p>
              )}

              <h2 style={grandTotal}>
                Grand Total: ₹ {selectedPurchase.grand_total}
              </h2>
            </div>
          ) : (
            <div style={emptyBox}>
              <h2>Select Purchase</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====================================
   STYLES
==================================== */

const pageStyle = {
  padding: 20,
};

const heading = {
  marginBottom: 20,
};

const mainBox = {
  display: "flex",
  gap: 20,
};

const leftBox = {
  width: "30%",
  background: "#fff",
  borderRadius: 10,
  padding: 15,
  height: "80vh",
  overflowY: "auto",
};

const rightBox = {
  width: "70%",
};

const purchaseCard = {
  padding: 15,
  borderBottom: "1px solid #eee",
  cursor: "pointer",
  transition: "0.3s",
};

const detailsBox = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
};

const emptyBox = {
  background: "#fff",
  padding: 50,
  borderRadius: 10,
  textAlign: "center",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 20,
};

const grandTotal = {
  textAlign: "right",
  marginTop: 20,
};
