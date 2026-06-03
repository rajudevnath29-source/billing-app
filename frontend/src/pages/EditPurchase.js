import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config/api";

export default function EditPurchase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierMobile, setSupplierMobile] = useState("");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState(18);

  const authHeader = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const loadData = async () => {
    try {
      const [itemRes, purchaseRes] = await Promise.all([
        axios.get(`${API_URL}/items`, authHeader),
        axios.get(`${API_URL}/purchases/${id}`, authHeader),
      ]);

      const purchase = purchaseRes.data.purchase;
      setItems(itemRes.data.items || []);
      setSupplierName(purchase.supplier_name || "");
      setSupplierMobile(purchase.supplier_mobile || "");
      setGstEnabled(Boolean(purchase.gst_enabled));
      setGstRate(purchase.gst_rate || 18);
      setCart(
        (purchase.items || []).map((item) => ({
          item_id: item.item_id?._id || item.item_id,
          item_name: item.item_name,
          purchase_price: Number(item.purchase_price || 0),
          qty: Number(item.qty || 1),
          serial_numbers: item.serial_numbers || [],
        })),
      );
    } catch (error) {
      toast.error("Failed to load purchase");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = items.filter((item) =>
    item.item_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = (item) => {
    const exists = cart.find((entry) => entry.item_id === item._id);

    if (exists) {
      setCart(
        cart.map((entry) =>
          entry.item_id === item._id
            ? { ...entry, qty: Number(entry.qty || 0) + 1 }
            : entry,
        ),
      );
      return;
    }

    setCart([
      ...cart,
      {
        item_id: item._id,
        item_name: item.item_name,
        purchase_price: Number(item.purchase_price || 0),
        qty: 1,
        serial_numbers: [],
      },
    ]);
  };

  const updateCartItem = (idValue, changes) => {
    setCart(
      cart.map((entry) =>
        entry.item_id === idValue ? { ...entry, ...changes } : entry,
      ),
    );
  };

  const removeItem = (idValue) => {
    setCart(cart.filter((entry) => entry.item_id !== idValue));
  };

  const subTotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.purchase_price || 0) * Number(item.qty || 0),
    0,
  );
  const gstAmount = gstEnabled ? (subTotal * Number(gstRate || 0)) / 100 : 0;
  const grandTotal = subTotal + gstAmount;

  const updatePurchase = async () => {
    if (!supplierName.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    if (cart.length === 0) {
      toast.error("Please add items");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/purchases/${id}`,
        {
          supplier_name: supplierName,
          supplier_mobile: supplierMobile,
          items: cart,
          gst_enabled: gstEnabled,
          gst_rate: gstRate,
        },
        authHeader,
      );

      toast.success("Purchase updated");
      navigate("/purchase-view");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update purchase",
      );
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading purchase...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Edit Purchase</h1>
          <p style={styles.subtitle}>Update supplier purchase and stock</p>
        </div>

        <button
          style={styles.secondaryBtn}
          onClick={() => navigate("/purchase-view")}
        >
          Back
        </button>
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Supplier Information</h3>
        <div style={styles.grid}>
          <label style={styles.field}>
            Supplier Name
            <input
              style={styles.input}
              value={supplierName}
              onChange={(event) => setSupplierName(event.target.value)}
            />
          </label>
          <label style={styles.field}>
            Supplier Mobile
            <input
              style={styles.input}
              value={supplierMobile}
              onChange={(event) => setSupplierMobile(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={{ ...styles.card, ...styles.itemsPanel }}>
          <div style={styles.itemHeader}>
            <h3 style={styles.sectionTitle}>Available Items</h3>
            <input
              style={styles.search}
              placeholder="Search item..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {filteredItems.map((item) => (
            <div key={item._id} style={styles.itemCard}>
              <div>
                <h4 style={styles.availableItemName}>{item.item_name}</h4>
                <p style={styles.stockText}>Stock: {item.opening_stock}</p>
              </div>
              <button style={styles.addBtn} onClick={() => addToCart(item)}>
                +
              </button>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cartTitle}>Purchase Cart</h2>

          {cart.length === 0 ? (
            <div style={styles.empty}>No items selected</div>
          ) : (
            <>
              <div style={styles.cartHeader}>
                <div>Item Name</div>
                <div>Qty</div>
                <div>Purchase Price</div>
                <div>Sr. No.</div>
                <div>Action</div>
              </div>

              {cart.map((item) => (
                <div key={item.item_id}>
                  <div style={styles.cartRow}>
                    <div style={styles.itemName}>{item.item_name}</div>
                    <input
                      type="number"
                      value={item.qty}
                      style={styles.qtyInput}
                      onChange={(event) =>
                        updateCartItem(item.item_id, {
                          qty: Number(event.target.value),
                        })
                      }
                    />
                    <input
                      type="number"
                      value={item.purchase_price}
                      style={styles.priceInput}
                      onChange={(event) =>
                        updateCartItem(item.item_id, {
                          purchase_price: Number(event.target.value),
                        })
                      }
                    />
                    <input
                      type="text"
                      value={item.serial_numbers?.join(",") || ""}
                      style={styles.serialInput}
                      onChange={(event) =>
                        updateCartItem(item.item_id, {
                          serial_numbers: event.target.value.split(","),
                        })
                      }
                    />
                    <button
                      className="app-action-btn app-action-delete"
                      style={styles.removeBtn}
                      title="Remove item"
                      aria-label="Remove item"
                      onClick={() => removeItem(item.item_id)}
                    >
                      🗑
                    </button>
                  </div>
                  <div style={styles.itemTotal}>
                    ₹{" "}
                    {(
                      Number(item.purchase_price || 0) * Number(item.qty || 0)
                    ).toFixed(2)}
                  </div>
                </div>
              ))}
            </>
          )}

          <div style={styles.taxSummaryWrapper}>
            <div style={styles.taxBox}>
              <h3>Tax Settings</h3>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={gstEnabled}
                  onChange={(event) => setGstEnabled(event.target.checked)}
                />
                Enable GST
              </label>
              {gstEnabled && (
                <input
                  style={styles.input}
                  type="number"
                  value={gstRate}
                  onChange={(event) => setGstRate(event.target.value)}
                />
              )}
            </div>

            <div style={styles.totalBox}>
              <div style={styles.totalRow}>
                <span>Subtotal :</span>
                <span>₹ {subTotal.toFixed(2)}</span>
              </div>
              <div style={styles.totalRow}>
                <span>GST :</span>
                <span>₹ {gstAmount.toFixed(2)}</span>
              </div>
              <hr />
              <div style={styles.grandRow}>
                <span>Grand Total :</span>
                <span>₹ {grandTotal.toFixed(2)}</span>
              </div>
              <button style={styles.purchaseBtn} onClick={updatePurchase}>
                Update Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 10 },
  loading: { padding: 50, textAlign: "center", fontSize: 18 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  title: { margin: 0, fontSize: 30, color: "#0f172a" },
  subtitle: { marginTop: 6, color: "#64748b" },
  card: {
    background: "#fff",
    padding: 14,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: 16,
  },
  sectionTitle: { margin: 0, color: "#0f172a" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 16,
  },
  field: { display: "grid", gap: 6, color: "#475569", fontWeight: 700 },
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
  itemHeader: { display: "grid", gap: 10, marginBottom: 10 },
  itemsPanel: { maxHeight: "calc(100vh - 210px)", overflowY: "auto" },
  itemCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 4px",
    borderBottom: "1px solid #eee",
  },
  availableItemName: { margin: 0, color: "#0f172a", fontSize: 14 },
  stockText: { margin: "2px 0 0", color: "#64748b", fontSize: 12 },
  addBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    width: 30,
    height: 30,
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
  },
  removeBtn: {
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtn: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    padding: "10px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
  },
  cartTitle: { margin: "0 0 14px", fontSize: 20, color: "#0f172a" },
  cartHeader: {
    display: "grid",
    gridTemplateColumns: "2.2fr 90px 160px 2.5fr 70px",
    gap: 10,
    paddingBottom: 10,
    marginBottom: 8,
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 700,
    color: "#64748b",
  },
  cartRow: {
    display: "grid",
    gridTemplateColumns: "2.2fr 90px 160px 2.5fr 70px",
    gap: 10,
    alignItems: "center",
    padding: "8px 0",
  },
  itemName: { fontWeight: 700, color: "#0f172a", fontSize: 14 },
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
  taxBox: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 },
  totalBox: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "12px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  grandRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 20,
    fontWeight: 700,
    color: "#16a34a",
    marginTop: 14,
  },
  purchaseBtn: {
    width: "100%",
    marginTop: 16,
    padding: 12,
    border: "none",
    borderRadius: 8,
    background: "#16a34a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  empty: { padding: 30, textAlign: "center", color: "#94a3b8" },
};
