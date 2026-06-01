import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { hasPermission } from "../utils/permissions";
import Select from "react-select";

const API_URL = "http://localhost:5000/api";

const toDateInputValue = (date = new Date()) => {
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const canChangeInvoiceDate = hasPermission("CHNAGE_INVOICE_DATE");

  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [discount, setDiscount] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState(18);
  const [paidAmount, setPaidAmount] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState(toDateInputValue());
  const [itemSearch, setItemSearch] = useState("");
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [draftItem, setDraftItem] = useState(null);
  const [originalQtyByItem, setOriginalQtyByItem] = useState({});
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

  const loadData = useCallback(async () => {
    try {
      const [itemRes, customerRes, invoiceRes] = await Promise.all([
        axios.get(`${API_URL}/items`, authHeader),
        axios.get(`${API_URL}/customers`, authHeader),
        axios.get(`${API_URL}/invoices/${id}`, authHeader),
      ]);

      const loadedInvoice = invoiceRes.data.invoice;
      const invoiceItems = (loadedInvoice.items || []).map((item, index) => ({
        ...item,
        line_id: `${item.item_id}-${index}-${Date.now()}`,
        serial_number: item.serial_number || "",
      }));
      const originalQty = invoiceItems.reduce((acc, item) => {
        const key = String(item.item_id);
        acc[key] = (acc[key] || 0) + Number(item.qty || 0);
        return acc;
      }, {});

      setItems(itemRes.data.items || []);
      setCustomers(customerRes.data.customers || []);
      setInvoice(loadedInvoice);
      setCart(invoiceItems);
      setOriginalQtyByItem(originalQty);
      setSelectedCustomer(
        loadedInvoice.customer?._id || loadedInvoice.customer || "",
      );
      setCustomerName(loadedInvoice.customer_name || "Cash");
      setCustomerMobile(loadedInvoice.customer_mobile || "");
      setDiscount(loadedInvoice.discount || 0);
      setGstEnabled(Boolean(loadedInvoice.gst_enabled));
      setGstRate(loadedInvoice.gst_rate || 18);
      setPaidAmount(loadedInvoice.paid_amount || 0);
      setInvoiceDate(
        toDateInputValue(loadedInvoice.invoiceDate || loadedInvoice.createdAt),
      );
    } catch (error) {
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }, [authHeader, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.item_name?.toLowerCase().includes(itemSearch.toLowerCase()),
    );
  }, [items, itemSearch]);

  const availableStock = (itemId) => {
    const item = items.find((entry) => String(entry._id) === String(itemId));
    return (
      Number(item?.opening_stock || 0) +
      Number(originalQtyByItem[String(itemId)] || 0)
    );
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId);

    if (!customerId) {
      setCustomerMobile("");
      return;
    }

    const customer = customers.find((entry) => entry._id === customerId);

    if (!customer) {
      setCustomerMobile("");
      return;
    }

    setCustomerName(customer.customer_name || "");
    setCustomerMobile(customer.phone || "");
  };

  const handleCustomerNameChange = (value) => {
    setCustomerName(value);

    const matchedCustomer = customers.find(
      (customer) =>
        customer.customer_name?.trim().toLowerCase() ===
        value.trim().toLowerCase(),
    );

    if (matchedCustomer) {
      setSelectedCustomer(matchedCustomer._id);
      setCustomerMobile(matchedCustomer.phone || "");
    } else {
      setSelectedCustomer(""); // Walk-in select
      // mobile ko force clear mat karo
    }
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
    const stock = availableStock(item._id);
    const alreadyInCart = cart.reduce(
      (sum, entry) =>
        String(entry.item_id) === String(item._id)
          ? sum + Number(entry.qty || 0)
          : sum,
      0,
    );

    if (stock <= 0) {
      toast.error(`${item.item_name} is out of stock`);
      return;
    }

    if (alreadyInCart >= stock) {
      toast.error(`All ${stock} ${item.item_name} already added`);
      return;
    }

    setDraftItem({
      item_id: item._id,
      item_name: item.item_name,
      price: Number(item.sales_price || 0),
      qty: 1,
      serial_number: "",
      stock,
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
    const stock = availableStock(cartItem?.item_id);
    const otherQty = cart.reduce(
      (sum, entry) =>
        String(entry.item_id) === String(cartItem?.item_id) &&
        entry.line_id !== lineId
          ? sum + Number(entry.qty || 0)
          : sum,
      0,
    );

    if (otherQty + nextQty > stock) {
      const remaining = Math.max(stock - otherQty, 0);
      toast.error(`Only ${remaining} ${cartItem?.item_name} left for this row`);
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
  const totalItems = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const safeDiscount = Math.min(Number(discount || 0), subTotal);
  const afterDiscount = subTotal - safeDiscount;
  const gstAmount = gstEnabled
    ? (afterDiscount * Number(gstRate || 0)) / 100
    : 0;
  const grandTotal = afterDiscount + gstAmount;
  const dueAmount = grandTotal - Number(paidAmount || 0);

  const updateInvoice = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (cart.length === 0) {
      toast.error("Invoice needs at least one item");
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `${API_URL}/invoices/${id}`,
        {
          customer: selectedCustomer || undefined,
          customer_name: customerName,
          customer_mobile: customerMobile,
          items: cart,
          discount: safeDiscount,
          gst_enabled: gstEnabled,
          gst_rate: Number(gstRate || 0),
          paid_amount: Number(paidAmount || 0),
          ...(canChangeInvoiceDate ? { invoiceDate } : {}),
        },
        authHeader,
      );

      toast.success("Invoice updated successfully");
      navigate("/invoice-view");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invoice update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading invoice...</div>;
  }
  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.customer_name,
    phone: c.phone,
  }));

  const allCustomerOptions = [
    { value: "", label: "Walk-in / New Customer" },
    ...customerOptions,
  ];
  if (!invoice) {
    return <div style={styles.empty}>Invoice not found</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Edit Invoice</h1>
          <p style={styles.subtitle}>
            {invoice.invoice_number} | Update invoice details
          </p>
        </div>

        <button
          style={styles.secondaryBtn}
          onClick={() => navigate("/invoice-view")}
        >
          Back to List
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
        <Select
          options={allCustomerOptions}
          value={
            allCustomerOptions.find(
              (option) => option.value === selectedCustomer,
            ) || allCustomerOptions[0]
          }
          onChange={(option) => handleCustomerSelect(option?.value || "")}
          placeholder="Search customer..."
          isSearchable
          styles={{
            control: (base, state) => ({
              ...base,
              padding: "2px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              boxShadow: "none",
              minHeight: "46px",
              fontSize: "14px",
              backgroundColor: "#fff",
              borderColor: state.isFocused ? "#94a3b8" : "#cbd5e1",
            }),
            valueContainer: (base) => ({
              ...base,
              padding: "0 10px",
            }),
            input: (base) => ({
              ...base,
              margin: 0,
              padding: 0,
            }),
            placeholder: (base) => ({
              ...base,
              color: "#94a3b8",
            }),
            singleValue: (base) => ({
              ...base,
              color: "#0f172a",
            }),
            menu: (base) => ({
              ...base,
              borderRadius: "12px",
              overflow: "hidden",
              marginTop: 4,
              border: "1px solid #e2e8f0",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "#f1f5f9" : "#fff",
              color: "#0f172a",
              cursor: "pointer",
            }),
          }}
        />

        <input
          placeholder="Customer name"
          value={customerName}
          onChange={(event) => handleCustomerNameChange(event.target.value)}
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
                    <p style={styles.muted}>
                      Edit details here only for this invoice
                    </p>
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
                                Rs {item.sales_price} | Available{" "}
                                {availableStock(item._id)}
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
                        <label style={styles.fieldLabel}>
                          Invoice item name
                        </label>
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

                        <label style={styles.fieldLabel}>
                          Serial / other note
                        </label>
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
                          <button
                            style={styles.secondaryBtn}
                            onClick={closeItemPicker}
                          >
                            Cancel
                          </button>

                          <button
                            style={styles.confirmBtn}
                            onClick={addDraftToCart}
                          >
                            Add to Invoice
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={styles.editorEmpty}>
                        Select an item to edit invoice details
                      </div>
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
                  onChange={(event) =>
                    changeQty(entry.line_id, event.target.value)
                  }
                  style={styles.qty}
                />

                <b>
                  Rs{" "}
                  {(Number(entry.price || 0) * Number(entry.qty || 0)).toFixed(
                    2,
                  )}
                </b>

                <button
                  className="app-action-btn app-action-delete"
                  style={styles.removeBtn}
                  title="Remove item"
                  aria-label="Remove item"
                  onClick={() => removeItem(entry.line_id)}
                >
                  🗑
                </button>
              </div>
            ))}

            {cart.length === 0 && (
              <div style={styles.emptyCart}>
                <p style={styles.emptyText}>Cart is empty</p>
                <button style={styles.secondaryBtn} onClick={openItemPicker}>
                  Add Item
                </button>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div style={styles.addMoreWrap}>
              <button style={styles.secondaryBtn} onClick={openItemPicker}>
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
            style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
            disabled={saving}
            onClick={updateInvoice}
          >
            {saving ? "Updating..." : "Update Invoice"}
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
    border: "none",
    padding: 0,
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
  saveBtn: {
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
