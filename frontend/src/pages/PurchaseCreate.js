import { useEffect, useState } from "react";
import axios from "axios";

export default function PurchaseCreate() {
  const [items, setItems] = useState([]);

  const [cart, setCart] = useState([]);

  const [supplier_name, setSupplierName] = useState("");

  const [supplier_mobile, setSupplierMobile] = useState("");

  const [discount, setDiscount] = useState(0);

  const [gstEnabled, setGstEnabled] = useState(false);

  const [gstRate, setGstRate] = useState(18);

  const token = localStorage.getItem("token");

  // ====================================
  // FETCH ITEMS
  // ====================================

  const fetchItems = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/items",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setItems(res.data.items);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ====================================
  // ADD TO CART
  // ====================================

  const addToCart = (item) => {
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

          purchase_price: item.purchase_price,

          qty: 1,
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
            }
          : c,
      ),
    );
  };

  // ====================================
  // CHANGE PRICE
  // ====================================

  const changePrice = (id, price) => {
    setCart(
      cart.map((c) =>
        c.item_id === id
          ? {
              ...c,
              purchase_price: Number(price),
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
    (sum, i) => sum + i.purchase_price * i.qty,

    0,
  );

  const afterDiscount = subTotal - Number(discount);

  const gstAmount = gstEnabled ? (afterDiscount * gstRate) / 100 : 0;

  const grandTotal = afterDiscount + gstAmount;

  // ====================================
  // CREATE PURCHASE
  // ====================================

  const createPurchase = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/purchases",

        {
          supplier_name,

          supplier_mobile,

          items: cart,

          discount,

          gst_enabled: gstEnabled,

          gst_rate: gstRate,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Purchase Created Successfully");

      // RESET
      setCart([]);

      setSupplierName("");

      setSupplierMobile("");

      setDiscount(0);

      setGstEnabled(false);

      setGstRate(18);

      fetchItems();
    } catch (error) {
      alert(error?.response?.data?.message || "Error creating purchase");
    }
  };

  return (
    <div style={pageStyle}>
      <h1 style={heading}>📦 Purchase Entry</h1>

      {/* SUPPLIER */}
      <div style={topBox}>
        <input
          style={input}
          placeholder="Supplier Name"
          value={supplier_name}
          onChange={(e) => setSupplierName(e.target.value)}
        />

        <input
          style={input}
          placeholder="Supplier Mobile"
          value={supplier_mobile}
          onChange={(e) => setSupplierMobile(e.target.value)}
        />
      </div>

      <div style={mainBox}>
        {/* LEFT */}
        <div style={leftBox}>
          <h3>Items</h3>

          {items.map((item) => (
            <div key={item._id} style={itemCard}>
              <div>
                <h4>{item.item_name}</h4>

                <p>
                  Stock:
                  {item.opening_stock}
                </p>
              </div>

              <button style={addBtn} onClick={() => addToCart(item)}>
                Add
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div style={rightBox}>
          <h3>Purchase Cart</h3>

          {cart.map((c) => (
            <div key={c.item_id} style={cartCard}>
              <div>
                <h4>{c.item_name}</h4>

                <p>Qty:</p>

                <input
                  style={smallInput}
                  type="number"
                  value={c.qty}
                  onChange={(e) => changeQty(c.item_id, e.target.value)}
                />

                <p>Purchase Price:</p>

                <input
                  style={smallInput}
                  type="number"
                  value={c.purchase_price}
                  onChange={(e) => changePrice(c.item_id, e.target.value)}
                />

                <p>Total: ₹{c.purchase_price * c.qty}</p>
              </div>

              <button style={deleteBtn} onClick={() => removeItem(c.item_id)}>
                ❌
              </button>
            </div>
          ))}

          {/* DISCOUNT */}
          <input
            style={input}
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
              Enable GST
            </label>

            {gstEnabled && (
              <input
                style={input}
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                placeholder="GST %"
              />
            )}
          </div>

          <hr />

          <h3>Subtotal: ₹ {subTotal}</h3>

          <h3>GST: ₹ {gstAmount.toFixed(2)}</h3>

          <h2>Grand Total: ₹ {grandTotal.toFixed(2)}</h2>

          <button style={purchaseBtn} onClick={createPurchase}>
            Save Purchase
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================
   STYLES
===================================== */

const pageStyle = {
  padding: 20,
};

const heading = {
  marginBottom: 20,
};

const topBox = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
};

const mainBox = {
  display: "flex",
  gap: 20,
};

const leftBox = {
  flex: 1,
  background: "#fff",
  padding: 20,
  borderRadius: 10,
};

const rightBox = {
  flex: 1,
  background: "#fff",
  padding: 20,
  borderRadius: 10,
};

const itemCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #eee",
  padding: 10,
};

const cartCard = {
  display: "flex",
  justifyContent: "space-between",
  borderBottom: "1px solid #eee",
  padding: 10,
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
};

const smallInput = {
  width: 100,
  padding: 5,
  marginBottom: 10,
};

const addBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 15px",
  borderRadius: 5,
  cursor: "pointer",
};

const deleteBtn = {
  background: "red",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 5,
  cursor: "pointer",
};

const purchaseBtn = {
  width: "100%",
  padding: 12,
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  marginTop: 20,
  cursor: "pointer",
  fontSize: 16,
};
