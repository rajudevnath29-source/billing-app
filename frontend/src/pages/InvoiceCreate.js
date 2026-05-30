import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { hasPermission } from "../utils/permissions";

const API_URL = "http://localhost:5000/api";

const toDateInputValue = (date = new Date()) => {
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function InvoiceCreate() {
  const token = localStorage.getItem("token");
  const canChangeInvoiceDate = hasPermission("CHNAGE_INVOICE_DATE");

  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerName, setCustomerName] = useState("Cash");
  const [customerMobile, setCustomerMobile] = useState("");
  const [discount, setDiscount] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState(18);
  const [paidAmount, setPaidAmount] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState(toDateInputValue());
  const [itemSearch, setItemSearch] = useState("");
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [draftItem, setDraftItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const authHeader = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const handleAuthError = useCallback((error) => {
    if (error?.response?.status !== 401) {
      return false;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.error("Session expired. Please login again.");
    window.location.href = "/";

    return true;
  }, []);

  const fetchData = useCallback(async () => {
    const [itemResult, customerResult] = await Promise.allSettled([
      axios.get(`${API_URL}/items`, authHeader),
      axios.get(`${API_URL}/customers`, authHeader),
    ]);

    if (itemResult.status === "fulfilled") {
      setItems(itemResult.value.data.items || []);
    } else if (!handleAuthError(itemResult.reason)) {
      toast.error(
        itemResult.reason?.response?.data?.message || "Failed to load items",
      );
    }

    if (customerResult.status === "fulfilled") {
      setCustomers(customerResult.value.data.customers || []);
    } else if (!handleAuthError(customerResult.reason)) {
      toast.error(
        customerResult.reason?.response?.data?.message ||
          "Failed to load customers",
      );
    }

    setLoading(false);
  }, [authHeader, handleAuthError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.item_name?.toLowerCase().includes(itemSearch.toLowerCase()),
    );
  }, [items, itemSearch]);

  const handleCustomerSelect = (id) => {
    setSelectedCustomer(id);

    const customer = customers.find((entry) => entry._id === id);
    if (!customer) {
      setCustomerName("Cash");
      setCustomerMobile("");
      return;
    }

    setCustomerName(customer.customer_name || "");
    setCustomerMobile(customer.phone || "");
  };

  const openItemPicker = () => {
    setItemPickerOpen(true);
    setDraftItem(null);
    setItemSearch("");
  };

  const closeItemPicker = () => {
    setItemPickerOpen(false);
    setDraftItem(null);
    setItemSearch("");
  };

  const selectDraftItem = (item) => {
    const alreadyInCart = cart.reduce(
      (sum, entry) =>
        entry.item_id === item._id ? sum + Number(entry.qty || 0) : sum,
      0,
    );

    if (Number(item.opening_stock || 0) <= 0) {
      toast.error(`${item.item_name} is out of stock`);
      return;
    }

    if (alreadyInCart >= Number(item.opening_stock || 0)) {
      toast.error(`All ${item.opening_stock} ${item.item_name} already added`);
      return;
    }

    setDraftItem({
      item_id: item._id,
      item_name: item.item_name,
      price: Number(item.sales_price || 0),
      qty: 1,
      serial_number: "",
      stock: Number(item.opening_stock || 0),
      alreadyInCart,
    });
  };

  const addDraftToCart = () => {
    if (!draftItem) {
      toast.error("Select an item first");
      return;
    }

    const nextQty = Math.max(1, Number(draftItem.qty || 1));
    const totalRequested = Number(draftItem.alreadyInCart || 0) + nextQty;

    if (totalRequested > Number(draftItem.stock || 0)) {
      const remaining = Math.max(
        Number(draftItem.stock || 0) - Number(draftItem.alreadyInCart || 0),
        0,
      );
      toast.error(`Only ${remaining} ${draftItem.item_name} left to add`);
      return;
    }

    const price = Number(draftItem.price || 0);
    setCart([
      ...cart,
      {
        line_id: `${draftItem.item_id}-${Date.now()}`,
        item_id: draftItem.item_id,
        item_name: draftItem.item_name.trim(),
        price,
        qty: nextQty,
        total: price * nextQty,
        serial_number: draftItem.serial_number.trim(),
      },
    ]);

    closeItemPicker();
  };

  const changeQty = (lineId, qty) => {
    const nextQty = Math.max(1, Number(qty || 1));
    const cartItem = cart.find((entry) => entry.line_id === lineId);
    const item = items.find((entry) => entry._id === cartItem?.item_id);
    const otherQty = cart.reduce(
      (sum, entry) =>
        entry.item_id === cartItem?.item_id && entry.line_id !== lineId
          ? sum + Number(entry.qty || 0)
          : sum,
      0,
    );

    if (item && otherQty + nextQty > Number(item.opening_stock || 0)) {
      const remaining = Math.max(Number(item.opening_stock || 0) - otherQty, 0);
      toast.error(`Only ${remaining} ${item.item_name} left for this row`);
      return;
    }

    setCart(
      cart.map((entry) =>
        entry.line_id === lineId
          ? {
              ...entry,
              qty: nextQty,
              total: Number(entry.price || 0) * nextQty,
            }
          : entry,
      ),
    );
  };

  const removeItem = (lineId) => {
    setCart(cart.filter((entry) => entry.line_id !== lineId));
  };

  const subTotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
    0,
  );
  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );
  const safeDiscount = Math.min(Number(discount || 0), subTotal);
  const afterDiscount = subTotal - safeDiscount;
  const gstAmount = gstEnabled ? (afterDiscount * Number(gstRate || 0)) / 100 : 0;
  const grandTotal = afterDiscount + gstAmount;
  const dueAmount = grandTotal - Number(paidAmount || 0);

  const resetForm = () => {
    setCart([]);
    setSelectedCustomer("");
    setCustomerName("Cash");
    setCustomerMobile("");
    setDiscount(0);
    setGstEnabled(false);
    setGstRate(18);
    setPaidAmount(0);
    setInvoiceDate(toDateInputValue());
    setItemSearch("");
    setItemPickerOpen(false);
    setDraftItem(null);
  };

  const createInvoice = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (cart.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    try {
      setSaving(true);

      await axios.post(
        `${API_URL}/invoices`,
        {
          customer: selectedCustomer || undefined,
          customer_name: customerName,
          customer_mobile: customerMobile,
          items: cart,
          discount: safeDiscount,
          paid_amount: Number(paidAmount || 0),
          gst_enabled: gstEnabled,
          gst_rate: Number(gstRate || 0),
          ...(canChangeInvoiceDate ? { invoiceDate } : {}),
        },
        authHeader,
      );

      toast.success("Invoice created successfully");
      resetForm();
      fetchData();
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }

      toast.error(error?.response?.data?.message || "Error creating invoice");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading invoice module...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Create Invoice</h1>
          <p style={styles.subtitle}>Select customer, add items and generate bill</p>
        </div>

        <button style={styles.secondaryBtn} onClick={resetForm}>
          Reset
        </button>
      </div>

      <div
        style={{
          ...styles.customerCard,
          gridTemplateColumns: canChangeInvoiceDate
            ? "repeat(4, minmax(0, 1fr))"
            : styles.customerCard.gridTemplateColumns,
        }}
      >
        <select
          value={selectedCustomer}
          onChange={(event) => handleCustomerSelect(event.target.value)}
          style={styles.input}
        >
          <option value="">Walk-in / New Customer</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.customer_name}
            </option>
          ))}
        </select>

        <input
          placeholder="Customer name"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Mobile"
          value={customerMobile}
          onChange={(event) => setCustomerMobile(event.target.value)}
          style={styles.input}
        />

        {canChangeInvoiceDate && (
          <input
            type="date"
            value={invoiceDate}
            onChange={(event) => setInvoiceDate(event.target.value)}
            style={styles.input}
          />
        )}
      </div>

      <div style={styles.invoiceGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Invoice Cart</h3>
            <div style={styles.headerActions}>
              <span style={styles.countBadge}>{totalItems} items</span>
            </div>
          </div>

          {itemPickerOpen && (
            <div style={styles.modalOverlay}>
              <div style={styles.itemModal}>
                <div style={styles.modalHeader}>
                  <div>
                    <h3 style={styles.modalTitle}>Add Invoice Item</h3>
                    <p style={styles.muted}>Edit details here only for this invoice</p>
                  </div>

                  <button style={styles.closeBtn} onClick={closeItemPicker}>
                    Close
                  </button>
                </div>

                <div style={styles.modalGrid}>
                  <div style={styles.selectorPane}>
                    <input
                      placeholder="Search item..."
                      value={itemSearch}
                      onChange={(event) => setItemSearch(event.target.value)}
                      style={styles.searchFull}
                    />

                    <div style={styles.itemList}>
                      {filteredItems.map((item) => {
                        const selected = draftItem?.item_id === item._id;

                        return (
                          <button
                            key={item._id}
                            type="button"
                            style={{
                              ...styles.selectItemRow,
                              ...(selected ? styles.selectedItemRow : {}),
                            }}
                            onClick={() => selectDraftItem(item)}
                          >
                            <span>
                              <b>{item.item_name}</b>
                              <small style={styles.itemMeta}>
                                Rs {item.sales_price} | Stock {item.opening_stock}
                              </small>
                            </span>
                          </button>
                        );
                      })}

                      {filteredItems.length === 0 && (
                        <div style={styles.empty}>No items found</div>
                      )}
                    </div>
                  </div>

                  <div style={styles.editorPane}>
                    {draftItem ? (
                      <>
                        <label style={styles.fieldLabel}>Invoice item name</label>
                        <input
                          value={draftItem.item_name}
                          onChange={(event) =>
                            setDraftItem({
                              ...draftItem,
                              item_name: event.target.value,
                            })
                          }
                          style={styles.input}
                        />

                        <div style={styles.editorGrid}>
                          <div>
                            <label style={styles.fieldLabel}>Price</label>
                            <input
                              type="number"
                              min="0"
                              value={draftItem.price}
                              onChange={(event) =>
                                setDraftItem({
                                  ...draftItem,
                                  price: event.target.value,
                                })
                              }
                              style={styles.input}
                            />
                          </div>

                          <div>
                            <label style={styles.fieldLabel}>Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={draftItem.qty}
                              onChange={(event) =>
                                setDraftItem({
                                  ...draftItem,
                                  qty: event.target.value,
                                })
                              }
                              style={styles.input}
                            />
                          </div>
                        </div>

                        <label style={styles.fieldLabel}>Serial / other note</label>
                        <textarea
                          value={draftItem.serial_number}
                          onChange={(event) =>
                            setDraftItem({
                              ...draftItem,
                              serial_number: event.target.value,
                            })
                          }
                          placeholder="Serial number, warranty note, IMEI, etc."
                          style={styles.textarea}
                        />

                        <div style={styles.modalActions}>
                          <button style={styles.secondaryBtn} onClick={closeItemPicker}>
                            Cancel
                          </button>

                          <button style={styles.confirmBtn} onClick={addDraftToCart}>
                            Add to Invoice
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={styles.editorEmpty}>Select an item to edit invoice details</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={styles.cartList}>
            {cart.map((entry) => (
              <div key={entry.line_id} style={styles.cartRow}>
                <div>
                  <b>{entry.item_name}</b>
                  <p style={styles.muted}>Rs {entry.price}</p>
                  {entry.serial_number && (
                    <p style={styles.serialText}>{entry.serial_number}</p>
                  )}
                </div>

                <input
                  type="number"
                  min="1"
                  value={entry.qty}
                  onChange={(event) => changeQty(entry.line_id, event.target.value)}
                  style={styles.qty}
                />

                <b>Rs {(entry.price * entry.qty).toFixed(2)}</b>

                <button
                  style={styles.removeBtn}
                  onClick={() => removeItem(entry.line_id)}
                >
                  Remove
                </button>
              </div>
            ))}

            {cart.length === 0 && (
              <div style={styles.emptyCart}>
                <p style={styles.emptyText}>Cart is empty</p>
                <button
                  style={styles.secondaryBtn}
                  onClick={openItemPicker}
                >
                  Add Item
                </button>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div style={styles.addMoreWrap}>
              <button
                style={styles.secondaryBtn}
                onClick={openItemPicker}
              >
                Add Item
              </button>
            </div>
          )}

          <div style={styles.adjustments}>
            <div>
              <label style={styles.fieldLabel}>Discount</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.fieldLabel}>Paid Amount</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={paidAmount}
                onChange={(event) => setPaidAmount(event.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.gstBox}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={gstEnabled}
                onChange={(event) => setGstEnabled(event.target.checked)}
              />
              Enable GST
            </label>

            {gstEnabled && (
              <input
                type="number"
                min="0"
                value={gstRate}
                onChange={(event) => setGstRate(event.target.value)}
                placeholder="GST %"
                style={styles.gstInput}
              />
            )}
          </div>

          <div style={styles.totalBox}>
            <TotalLine label="Subtotal" value={subTotal} />
            <TotalLine label="Discount" value={safeDiscount} />
            <TotalLine label="GST" value={gstAmount} />
            <div style={styles.grandLine}>
              <span>Grand Total</span>
              <b>Rs {grandTotal.toFixed(2)}</b>
            </div>
            <TotalLine label="Due" value={dueAmount} />
          </div>

          <button
            style={{ ...styles.invoiceBtn, opacity: saving ? 0.7 : 1 }}
            disabled={saving}
            onClick={createInvoice}
          >
            {saving ? "Generating..." : "Generate Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TotalLine({ label, value }) {
  return (
    <div style={styles.totalLine}>
      <span>{label}</span>
      <b>Rs {Number(value || 0).toFixed(2)}</b>
    </div>
  );
}

const styles = {
  page: {
    padding: 10,
  },
  loading: {
    padding: 50,
    textAlign: "center",
    fontSize: 18,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
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
  customerCard: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 15,
    marginBottom: 20,
  },
  invoiceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    padding: 18,
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  cardTitle: {
    margin: 0,
    color: "#0f172a",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: 20,
  },
  itemModal: {
    width: "min(920px, 100%)",
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 24px 70px rgba(15,23,42,0.25)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: 18,
    borderBottom: "1px solid #e2e8f0",
  },
  modalTitle: {
    margin: 0,
    color: "#0f172a",
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "0.95fr 1.05fr",
    gap: 16,
    padding: 18,
  },
  selectorPane: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 14,
    background: "#f8fafc",
  },
  editorPane: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 14,
  },
  closeBtn: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  itemList: {
    maxHeight: 320,
    overflowY: "auto",
    marginTop: 12,
  },
  selectItemRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    padding: 13,
    background: "#fff",
    border: "none",
    borderBottom: "1px solid #f1f5f9",
    textAlign: "left",
    cursor: "pointer",
  },
  selectedItemRow: {
    background: "#eef2ff",
  },
  itemMeta: {
    display: "block",
    marginTop: 5,
    color: "#64748b",
  },
  cartList: {
    minHeight: 130,
  },
  cartRow: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) 90px 140px 95px",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    borderBottom: "1px solid #f1f5f9",
  },
  muted: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 13,
  },
  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  search: {
    flex: 1,
    maxWidth: 260,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    outline: "none",
  },
  searchFull: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
    boxSizing: "border-box",
  },
  qty: {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    width: "100%",
    boxSizing: "border-box",
  },
  editorGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 12,
  },
  fieldLabel: {
    display: "block",
    margin: "12px 0 7px",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
  },
  textarea: {
    width: "100%",
    minHeight: 82,
    resize: "vertical",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  confirmBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "11px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  editorEmpty: {
    minHeight: 240,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    textAlign: "center",
  },
  serialText: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 12,
  },
  removeBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "9px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtn: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    padding: "11px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
  },
  countBadge: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  adjustments: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    padding: 16,
  },
  addMoreWrap: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "0 16px 16px",
  },
  gstBox: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "0 16px 16px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#334155",
    fontWeight: 600,
  },
  gstInput: {
    padding: 10,
    width: 120,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
  },
  totalBox: {
    margin: "0 16px",
    background: "#f8fafc",
    borderRadius: 14,
    padding: 16,
  },
  totalLine: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    color: "#475569",
  },
  grandLine: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #cbd5e1",
    marginTop: 8,
    paddingTop: 12,
    fontSize: 20,
    color: "#0f172a",
  },
  invoiceBtn: {
    width: "calc(100% - 32px)",
    margin: 16,
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    cursor: "pointer",
    fontWeight: 700,
  },
  empty: {
    padding: 35,
    textAlign: "center",
    color: "#64748b",
  },
  emptyCart: {
    minHeight: 130,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    color: "#64748b",
  },
  emptyText: {
    margin: 0,
  },
};
