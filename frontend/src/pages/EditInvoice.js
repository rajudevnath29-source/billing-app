import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import axios from "axios";

import Layout from "../components/Layout";

export default function EditInvoice() {
  const { id } = useParams();

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);

  const [cart, setCart] = useState([]);

  const [invoice, setInvoice] = useState(null);

  const [discount, setDiscount] = useState(0);

  const [gstEnabled, setGstEnabled] = useState(false);

  const [gstRate, setGstRate] = useState(18);

  const [paidAmount, setPaidAmount] = useState(0);

  // ====================================
  // LOAD DATA
  // ====================================

  const loadData = async () => {
    try {
      // ITEMS

      const itemRes = await axios.get(
        "http://localhost:5000/api/items",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setItems(itemRes.data.items);

      // INVOICE

      const invRes = await axios.get(
        `http://localhost:5000/api/invoices/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const inv = invRes.data.invoice;

      setInvoice(inv);

      setCart(inv.items);

      setDiscount(inv.discount || 0);

      setGstEnabled(inv.gst_enabled);

      setGstRate(inv.gst_rate || 18);

      setPaidAmount(inv.paid_amount || 0);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ====================================
  // ADD ITEM
  // ====================================

  const addItem = (item) => {
    const exists = cart.find((c) => c.item_id === item._id);

    if (exists) {
      setCart(
        cart.map((c) =>
          c.item_id === item._id
            ? {
                ...c,

                qty: c.qty + 1,
              }
            : c,
        ),
      );
    } else {
      setCart([
        ...cart,

        {
          item_id: item._id,

          item_name: item.item_name,

          price: item.sales_price,

          qty: 1,

          total: item.sales_price,
        },
      ]);
    }
  };

  // ====================================
  // CHANGE QTY
  // ====================================

  const changeQty = (id, qty) => {
    setCart(
      cart.map((c) =>
        c.item_id === id
          ? {
              ...c,

              qty: Number(qty),

              total: c.price * Number(qty),
            }
          : c,
      ),
    );
  };

  // ====================================
  // REMOVE ITEM
  // ====================================

  const removeItem = (id) => {
    setCart(cart.filter((c) => c.item_id !== id));
  };

  // ====================================
  // TOTALS
  // ====================================

  const subTotal = cart.reduce(
    (sum, i) => sum + i.price * i.qty,

    0,
  );

  const afterDiscount = subTotal - Number(discount);

  const gstAmount = gstEnabled ? (afterDiscount * gstRate) / 100 : 0;

  const grandTotal = afterDiscount + gstAmount;

  const dueAmount = grandTotal - paidAmount;

  // ====================================
  // UPDATE INVOICE
  // ====================================

  const updateInvoice = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/invoices/${id}`,

        {
          items: cart,

          discount,

          gst_enabled: gstEnabled,

          gst_rate: gstRate,

          paid_amount: paidAmount,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Invoice updated");

      navigate("/invoice-view");
    } catch (error) {
      alert(error?.response?.data?.message);
    }
  };

  if (!invoice) {
    return (
      <Layout>
        <h2>Loading...</h2>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={page}>
        <h1>✏️ Edit Invoice</h1>

        <div style={container}>
          {/* ITEMS */}

          <div style={left}>
            <h3>Add Items</h3>

            {items.map((item) => (
              <div key={item._id} style={itemBox}>
                <div>
                  <b>{item.item_name}</b>

                  <p>₹ {item.sales_price}</p>
                </div>

                <button onClick={() => addItem(item)}>Add</button>
              </div>
            ))}
          </div>

          {/* CART */}

          <div style={right}>
            <h3>Invoice Items</h3>

            {cart.map((c) => (
              <div key={c.item_id} style={cartBox}>
                <div>
                  <b>{c.item_name}</b>

                  <p>₹ {c.price}</p>
                </div>

                <input
                  type="number"
                  value={c.qty}
                  onChange={(e) =>
                    changeQty(
                      c.item_id,

                      e.target.value,
                    )
                  }
                />

                <p>₹ {c.price * c.qty}</p>

                <button onClick={() => removeItem(c.item_id)}>❌</button>
              </div>
            ))}

            {/* DISCOUNT */}

            <input
              type="number"
              placeholder="Discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />

            {/* GST */}

            <div
              style={{
                marginTop: 10,
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={gstEnabled}
                  onChange={(e) => setGstEnabled(e.target.checked)}
                />
                GST Enabled
              </label>
            </div>

            {gstEnabled && (
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
              />
            )}

            {/* PAYMENT */}

            <input
              type="number"
              placeholder="Paid Amount"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />

            {/* TOTALS */}

            <div style={totalBox}>
              <p>Subtotal: ₹ {subTotal}</p>

              <p>GST: ₹ {gstAmount}</p>

              <p>Due: ₹ {dueAmount}</p>

              <h2>Grand Total: ₹ {grandTotal}</h2>
            </div>

            <button style={saveBtn} onClick={updateInvoice}>
              Update Invoice
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ====================================
   STYLES
==================================== */

const page = {
  padding: 20,
};

const container = {
  display: "flex",
  gap: 20,
};

const left = {
  width: "40%",
  background: "#fff",
  padding: 20,
  borderRadius: 10,
};

const right = {
  width: "60%",
  background: "#fff",
  padding: 20,
  borderRadius: 10,
};

const itemBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 10,
  borderBottom: "1px solid #eee",
};

const cartBox = {
  display: "grid",
  gridTemplateColumns: "2fr 80px 100px 50px",
  gap: 10,
  alignItems: "center",
  padding: 10,
  borderBottom: "1px solid #eee",
};

const totalBox = {
  marginTop: 20,
};

const saveBtn = {
  marginTop: 20,
  width: "100%",
  padding: 14,
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};
