import { useEffect, useState } from "react";
import axios from "axios";

export default function InvoiceCreate() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [cart, setCart] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");

  const [customer_name, setCustomerName] = useState("");

  const [customer_mobile, setCustomerMobile] = useState("");

  const [discount, setDiscount] = useState(0);

  // GST
  const [gstEnabled, setGstEnabled] = useState(false);

  const [gstRate, setGstRate] = useState(18);

  const [paidAmount, setPaidAmount] = useState(0);

  const token = localStorage.getItem("token");

  // FETCH ITEMS
  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(res.data.items);
    } catch (error) {
      console.log(error);
    }
  };

  // FETCH CUSTOMERS
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCustomers(res.data.customers);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCustomers();
  }, []);

  // SELECT CUSTOMER
  const handleCustomerSelect = (id) => {
    setSelectedCustomer(id);

    const customer = customers.find((c) => c._id === id);

    if (customer) {
      setCustomerName(customer.customer_name);

      setCustomerMobile(customer.phone);
    }
  };

  // ADD TO CART
  const addToCart = (item) => {
    const exists = cart.find((c) => c.item_id === item._id);

    if (exists) {
      setCart(
        cart.map((c) =>
          c.item_id === item._id ? { ...c, qty: c.qty + 1 } : c,
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
        },
      ]);
    }
  };

  // CHANGE QTY
  const changeQty = (id, qty) => {
    setCart(
      cart.map((c) =>
        c.item_id === id
          ? {
              ...c,
              qty: Number(qty),
            }
          : c,
      ),
    );
  };

  // REMOVE ITEM
  const removeItem = (id) => {
    setCart(cart.filter((c) => c.item_id !== id));
  };

  // TOTALS
  const subTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const afterDiscount = subTotal - Number(discount || 0);

  const gstAmount = gstEnabled ? (afterDiscount * gstRate) / 100 : 0;

  const grandTotal = afterDiscount + gstAmount;

  // CREATE INVOICE
  const createInvoice = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/invoices",
        {
          customer: selectedCustomer,
          customer_name,
          customer_mobile,

          items: cart,

          discount,

          paid_amount: paidAmount,
          gst_enabled: gstEnabled,
          gst_rate: gstRate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Invoice Created Successfully");

      // RESET
      setCart([]);

      setSelectedCustomer("");

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
    <div style={styles.page}>
      <h2 style={styles.heading}>🧾 Create Invoice</h2>

      {/* CUSTOMER */}
      <div style={styles.customerBox}>
        <select
          value={selectedCustomer}
          onChange={(e) => handleCustomerSelect(e.target.value)}
          style={styles.input}
        >
          <option value="">Select Customer</option>

          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.customer_name}
            </option>
          ))}
        </select>

        <input
          placeholder="Customer Name"
          value={customer_name}
          onChange={(e) => setCustomerName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Mobile"
          value={customer_mobile}
          onChange={(e) => setCustomerMobile(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.mainGrid}>
        {/* ITEMS */}
        <div style={styles.leftBox}>
          <h3>📦 Items</h3>

          {items.map((item) => (
            <div key={item._id} style={styles.itemCard}>
              <div>
                <b>{item.item_name}</b>

                <p>₹ {item.sales_price}</p>
              </div>

              <button style={styles.addBtn} onClick={() => addToCart(item)}>
                Add
              </button>
            </div>
          ))}
        </div>

        {/* CART */}
        <div style={styles.rightBox}>
          <h3>🛒 Invoice Cart</h3>

          {cart.map((c) => (
            <div key={c.item_id} style={styles.cartCard}>
              <div>
                <b>{c.item_name}</b>

                <p>₹ {c.price}</p>
              </div>

              <input
                type="number"
                value={c.qty}
                onChange={(e) => changeQty(c.item_id, e.target.value)}
                style={styles.qty}
              />

              <p>₹ {c.price * c.qty}</p>

              <button
                style={styles.deleteBtn}
                onClick={() => removeItem(c.item_id)}
              >
                ❌
              </button>
            </div>
          ))}

          {/* DISCOUNT */}
          <input
            placeholder="Discount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            style={styles.input}
          />

          <input
            type="number"
            placeholder="Paid Amount"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
          />

          {/* GST */}
          <div style={styles.gstBox}>
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
                style={styles.gstInput}
              />
            )}
          </div>

          {/* TOTALS */}
          <div style={styles.totalBox}>
            <p>Subtotal: ₹ {subTotal.toFixed(2)}</p>

            <p>Paid: ₹ {paidAmount}</p>

            <p>Due: ₹ {(grandTotal - paidAmount).toFixed(2)}</p>

            <p>Discount: ₹ {discount}</p>

            <p>GST: ₹ {gstAmount.toFixed(2)}</p>

            <h2>Grand Total: ₹ {grandTotal.toFixed(2)}</h2>
          </div>

          <button style={styles.invoiceBtn} onClick={createInvoice}>
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: 20,
  },

  heading: {
    marginBottom: 20,
  },

  customerBox: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 15,
    marginBottom: 20,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },

  leftBox: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  rightBox: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  itemCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottom: "1px solid #eee",
  },

  cartCard: {
    display: "grid",
    gridTemplateColumns: "2fr 80px 100px 50px",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderBottom: "1px solid #eee",
  },

  qty: {
    padding: 8,
  },

  addBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
  },

  deleteBtn: {
    border: "none",
    background: "#ef4444",
    color: "#fff",
    padding: 8,
    borderRadius: 6,
    cursor: "pointer",
  },

  invoiceBtn: {
    width: "100%",
    marginTop: 20,
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
  },

  input: {
    padding: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
  },

  gstBox: {
    marginTop: 15,
  },

  gstInput: {
    marginTop: 10,
    padding: 10,
    width: 120,
  },

  totalBox: {
    marginTop: 20,
    background: "#f8fafc",
    padding: 15,
    borderRadius: 8,
  },
};
