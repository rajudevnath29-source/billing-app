import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function InvoiceCreate() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);

  const [customer_name, setCustomerName] = useState("");
  const [customer_mobile, setCustomerMobile] = useState("");

  const [discount, setDiscount] = useState(0);

  // GST STATES
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState(18);

  const token = localStorage.getItem("token");

  // FETCH ITEMS
  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setItems(res.data.items);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ADD TO CART
  const addToCart = (item) => {
    const exists = cart.find((c) => c.item_id === item._id);

    if (exists) {
      setCart(
        cart.map((c) =>
          c.item_id === item._id
            ? { ...c, qty: c.qty + 1 }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          item_id: item._id,
          item_name: item.item_name,
          price: item.sales_price,
          qty: 1
        }
      ]);
    }
  };

  // CHANGE QTY
  const changeQty = (id, qty) => {
    setCart(
      cart.map((c) =>
        c.item_id === id
          ? { ...c, qty: Number(qty) }
          : c
      )
    );
  };

  // REMOVE ITEM
  const removeItem = (id) => {
    setCart(cart.filter((c) => c.item_id !== id));
  };

  // TOTAL CALCULATION
  const subTotal = cart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  const afterDiscount = subTotal - Number(discount || 0);

  const gstAmount = gstEnabled
    ? (afterDiscount * gstRate) / 100
    : 0;

  const grandTotal = afterDiscount + gstAmount;

  // CREATE INVOICE
  const createInvoice = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/invoices",
        {
          customer_name,
          customer_mobile,
          items: cart,
          discount,
          gst_enabled: gstEnabled,
          gst_rate: gstRate
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Invoice Created Successfully");

      // RESET
      setCart([]);
      setCustomerName("");
      setCustomerMobile("");
      setDiscount(0);
      setGstEnabled(false);
      setGstRate(18);

    } catch (error) {
      alert(error?.response?.data?.message || "Error creating invoice");
    }
  };

  return (
    <Layout>

      <h2>🧾 Create Invoice</h2>

      {/* CUSTOMER INFO */}
      <div style={box}>
        <input
          placeholder="Customer Name"
          value={customer_name}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <input
          placeholder="Mobile"
          value={customer_mobile}
          onChange={(e) => setCustomerMobile(e.target.value)}
        />
      </div>

      {/* ITEMS */}
      <div style={{ display: "flex", gap: 20 }}>

        {/* ITEM LIST */}
        <div style={leftBox}>
          <h3>Items</h3>

          {items.map((item) => (
            <div key={item._id} style={itemBox}>
              <p><b>{item.item_name}</b></p>
              <p>₹ {item.sales_price}</p>

              <button onClick={() => addToCart(item)}>
                Add
              </button>
            </div>
          ))}
        </div>

        {/* CART */}
        <div style={rightBox}>
          <h3>Cart</h3>

          {cart.map((c) => (
            <div key={c.item_id} style={cartBox}>

              <p>{c.item_name}</p>

              <input
                type="number"
                value={c.qty}
                onChange={(e) =>
                  changeQty(c.item_id, e.target.value)
                }
              />

              <p>Total: ₹ {c.price * c.qty}</p>

              <button onClick={() => removeItem(c.item_id)}>
                ❌
              </button>
            </div>
          ))}

          {/* DISCOUNT */}
          <input
            placeholder="Discount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />

          {/* GST TOGGLE */}
          <div style={{ marginTop: 10 }}>
            <label>
              <input
                type="checkbox"
                checked={gstEnabled}
                onChange={(e) => setGstEnabled(e.target.checked)}
              />
              Enable GST
            </label>

            {gstEnabled && (
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                placeholder="GST %"
              />
            )}
          </div>

          <hr />

          {/* TOTALS */}
          <p>Subtotal: ₹ {subTotal}</p>
          <p>Discount: ₹ {discount}</p>
          <p>GST: ₹ {gstAmount.toFixed(2)}</p>

          <h3>Grand Total: ₹ {grandTotal.toFixed(2)}</h3>

          {/* BUTTON */}
          <button onClick={createInvoice}>
            Generate Invoice
          </button>
        </div>

      </div>

    </Layout>
  );
}

/* STYLES */
const box = {
  display: "flex",
  gap: 10,
  marginBottom: 20
};

const leftBox = {
  flex: 1,
  padding: 10,
  border: "1px solid #ddd"
};

const rightBox = {
  flex: 1,
  padding: 10,
  border: "1px solid #ddd"
};

const itemBox = {
  borderBottom: "1px solid #eee",
  padding: 10
};

const cartBox = {
  display: "flex",
  justifyContent: "space-between",
  padding: 10,
  borderBottom: "1px solid #eee"
};