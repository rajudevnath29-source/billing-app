import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../config/api";

export default function PurchaseCreate() {
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [supplier_name, setSupplierName] = useState("");
  const [supplier_mobile, setSupplierMobile] = useState("");

  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState(18);

  // =========================
  // FETCH ITEMS
  // =========================

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(res.data.items || []);
    } catch (error) {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // =========================
  // SEARCH ITEMS
  // =========================

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.item_name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  // =========================
  // ADD TO CART
  // =========================

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

      return;
    }

    setCart([
      ...cart,
      {
        item_id: item._id,
        item_name: item.item_name,
        purchase_price: Number(item.purchase_price) || 0,
        qty: 1,
        serial_numbers: [],
      },
    ]);
  };

  // =========================
  // CHANGE QTY
  // =========================

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

  // =========================
  // CHANGE PRICE
  // =========================

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

  // =========================
  // REMOVE ITEM
  // =========================

  const removeItem = (id) => {
    setCart(cart.filter((c) => c.item_id !== id));

    toast.success("Item removed");
  };

  // =========================
  // CALCULATIONS
  // =========================

  const subTotal = cart.reduce(
    (sum, item) => sum + item.purchase_price * item.qty,
    0,
  );

  const gstAmount = gstEnabled ? (subTotal * Number(gstRate)) / 100 : 0;

  const grandTotal = subTotal + gstAmount;
  // =========================
  // CREATE PURCHASE
  // =========================

  const createPurchase = async () => {
    if (!supplier_name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    if (cart.length === 0) {
      toast.error("Please add items");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/purchases`,
        {
          supplier_name,
          supplier_mobile,
          items: cart,
          gst_enabled: gstEnabled,
          gst_rate: gstRate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Purchase saved successfully");

      setCart([]);
      setSupplierName("");
      setSupplierMobile("");
      setGstEnabled(false);
      setGstRate(18);

      fetchItems();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create purchase",
      );
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>📦 Purchase Entry</h1>

        <p style={styles.subtitle}>Manage supplier purchases and stock</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Supplier Information</h3>

        <div style={styles.grid}>
          <div>
            <label>Supplier Name</label>

            <input
              style={styles.input}
              value={supplier_name}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Supplier name"
            />
          </div>

          <div>
            <label>Supplier Mobile</label>

            <input
              style={styles.input}
              value={supplier_mobile}
              onChange={(e) => setSupplierMobile(e.target.value)}
              placeholder="Mobile number"
            />
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* LEFT */}

        <div style={{ ...styles.card, ...styles.itemsPanel }}>
          <div style={styles.itemHeader}>
            <h3>Available Items</h3>

            <input
              style={styles.search}
              placeholder="Search item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredItems.map((item) => (
            <div key={item._id} style={styles.itemCard}>
              <div>
                <h4 style={styles.availableItemName}>{item.item_name}</h4>

                <p style={styles.stockText}>
                  Stock:
                  {item.opening_stock}
                </p>
              </div>

              <button style={styles.addBtn} onClick={() => addToCart(item)}>
                +
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div style={styles.card}>
          <h2 style={styles.cartTitle}>Purchase Cart</h2>

          {cart.length === 0 ? (
            <div style={styles.empty}>No items selected</div>
          ) : (
            <>
              {/* Header */}
              <div style={styles.cartHeader}>
                <div>Item Name</div>
                <div>Qty</div>
                <div>Purchase Price</div>
                <div>Sr. No. (comma separated)</div>
                <div>Action</div>
              </div>

              {cart.map((item) => (
                <div key={item.item_id}>
                  <div style={styles.cartRow}>
                    <div style={styles.itemName}>{item.item_name}</div>

                    <div>
                      <input
                        type="number"
                        value={item.qty}
                        style={styles.qtyInput}
                        onChange={(e) =>
                          changeQty(item.item_id, e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        value={item.purchase_price}
                        style={styles.priceInput}
                        onChange={(e) =>
                          changePrice(item.item_id, e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={item.serial_numbers?.join(",") || ""}
                        style={styles.serialInput}
                        placeholder="SN001,SN002"
                        onChange={(e) =>
                          setCart(
                            cart.map((c) =>
                              c.item_id === item.item_id
                                ? {
                                    ...c,
                                    serial_numbers: e.target.value.split(","),
                                  }
                                : c,
                            ),
                          )
                        }
                      />
                    </div>

                    <div>
                      <button
                        style={styles.removeBtn}
                        onClick={() => removeItem(item.item_id)}
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <div style={styles.itemTotal}>
                    ₹{(item.purchase_price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </>
          )}

          <div style={styles.taxSummaryWrapper}>
            {/* GST BOX */}

            <div style={styles.taxBox}>
              <h3>Tax Settings</h3>

              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={gstEnabled}
                  onChange={(e) => setGstEnabled(e.target.checked)}
                />
                Enable GST
              </label>

              {gstEnabled && (
                <>
                  <label style={styles.gstLabel}>GST Rate (%)</label>

                  <input
                    style={styles.input}
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                  />
                </>
              )}
            </div>

            {/* TOTAL BOX */}

            <div style={styles.totalBox}>
              <div style={styles.totalRow}>
                <span>Subtotal :</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>

              <div style={styles.totalRow}>
                <span>GST :</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>

              <hr />

              <div style={styles.grandRow}>
                <span>Grand Total :</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              <button style={styles.purchaseBtn} onClick={createPurchase}>
                Save Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const styles = {
  page: {
    padding: 10,
  },

  header: {
    marginBottom: 25,
  },

  title: {
    margin: 0,
    fontSize: 30,
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 8,
    color: "#64748b",
  },

  card: {
    background: "#fff",
    padding: 14,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: 16,
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: 20,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 20,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: 16,
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    marginTop: 8,
    outline: "none",
    boxSizing: "border-box",
  },

  search: {
    width: "100%",
    padding: 9,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    outline: "none",
  },

  itemHeader: {
    display: "grid",
    gap: 10,
    marginBottom: 10,
  },

  itemsPanel: {
    maxHeight: "calc(100vh - 210px)",
    overflowY: "auto",
  },

  itemCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 4px",
    borderBottom: "1px solid #eee",
  },

  availableItemName: {
    margin: 0,
    color: "#0f172a",
    fontSize: 14,
    lineHeight: 1.25,
  },

  stockText: {
    margin: "2px 0 0",
    color: "#64748b",
    fontSize: 12,
  },

  addBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    width: 30,
    height: 30,
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },

  removeBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    width: 32,
    height: 32,
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 15,
    marginBottom: 15,
  },

  purchaseBtn: {
    width: "100%",
    marginTop: 20,
    padding: 14,
    border: "none",
    borderRadius: 12,
    background: "#16a34a",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },

  empty: {
    padding: 30,
    textAlign: "center",
    color: "#94a3b8",
  },

  cartTitle: {
    margin: "0 0 14px",
    fontSize: 20,
    fontWeight: 700,
  },

  cartHeader: {
    display: "grid",
    gridTemplateColumns: "2.2fr 90px 160px 2.5fr 120px",
    gap: 10,
    paddingBottom: 10,
    marginBottom: 8,
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 700,
    color: "#64748b",
  },

  cartRow: {
    display: "grid",
    gridTemplateColumns: "2.2fr 90px 160px 2.5fr 120px",
    gap: 10,
    alignItems: "center",
    padding: "8px 0",
  },

  itemName: {
    fontWeight: 700,
    color: "#0f172a",
    fontSize: 14,
    lineHeight: 1.3,
  },

  qtyInput: {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
  },

  priceInput: {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
  },

  serialInput: {
    width: "100%",
    minWidth: 250,
    padding: 8,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
  },

  itemTotal: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: "1px solid #e5e7eb",
  },

  taxSummaryWrapper: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 14,
    marginTop: 16,
  },

  taxBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 14,
  },

  totalBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 14,
  },

  gstLabel: {
    display: "block",
    marginBottom: 8,
    color: "#64748b",
    fontWeight: 600,
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 18,
    fontSize: 18,
  },

  grandRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 20,
    fontWeight: 700,
    color: "#16a34a",
    marginTop: 20,
    whiteSpace: "nowrap",
  },
};
