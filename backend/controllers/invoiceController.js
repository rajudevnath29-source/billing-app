const Invoice = require("../models/Invoice");
const Item = require("../models/Item");
const Customer = require("../models/Customer");
const createStockHistory = require("../utils/createStockHistory");
const Counter = require("../models/Counter");

const createInvoice = async (req, res) => {
  try {
    const {
      customer,
      customer_name,
      customer_mobile,
      items,
      discount = 0,
      gst_enabled = false,
      gst_rate = 0,
      paid_amount = 0,
      invoiceDate = new Date(),
    } = req.body;

    // VALIDATION
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Items required",
      });
    }

    // 🔥 AUTO CUSTOMER CREATE
    let customerId = customer || null;

    // IF CUSTOMER NOT SELECTED  // CREATE NEW CUSTOMER
    if (!customerId) {
      const existingCustomer = await Customer.create({
        customer_name,
        phone: customer_mobile,
      });
      customerId = existingCustomer._id;
    }

    const counter = await Counter.findOneAndUpdate(
      { name: "invoice" },
      { $inc: { value: 1 } },
      { new: true, upsert: true },
    );

    if (!counter.value) {
      counter.value = 1;
    }
    const invoice_number = `INV-${String(counter.value).padStart(4, "0")}`;

    const requestedQtyByItem = items.reduce((acc, item) => {
      const key = String(item.item_id);
      acc[key] = (acc[key] || 0) + Number(item.qty || 0);
      return acc;
    }, {});

    for (let itemId of Object.keys(requestedQtyByItem)) {
      const itemData = await Item.findById(itemId);

      if (!itemData) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      if (itemData.opening_stock < requestedQtyByItem[itemId]) {
        return res.status(400).json({
          message: `${itemData.item_name} only ${itemData.opening_stock} in stock`,
        });
      }
    }

    let sub_total = 0;
    let formattedItems = [];
    for (let i of items) {
      const itemData = await Item.findById(i.item_id);

      // ITEM NOT FOUND
      if (!itemData) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      // ITEM TOTAL
      const invoicePrice = Number(i.price ?? itemData.sales_price);
      const total = invoicePrice * i.qty;
      sub_total += total;

      formattedItems.push({
        item_id: itemData._id,
        item_name: i.item_name || itemData.item_name,
        qty: i.qty,
        price: invoicePrice,
        total,
        serial_number: i.serial_number || "",
      });

      // 🔥 AUTO STOCK REDUCE
      const previousStock = itemData.opening_stock;
      itemData.opening_stock -= i.qty;
      await itemData.save();

      // STOCK HISTORY
      await createStockHistory({
        item: itemData._id,
        type: "SALE",
        qty: i.qty,
        previous_stock: previousStock,
        new_stock: itemData.opening_stock,
        note: "Invoice Sale",
        reference_id: invoice_number,
        created_by: req.user.id,
      });
    }

    // 💰 CALCULATIONS
    const afterDiscount = sub_total - Number(discount);
    let gst_amount = 0;

    if (gst_enabled) {
      gst_amount = (afterDiscount * gst_rate) / 100;
    }
    const grand_total = afterDiscount + gst_amount;
    const due_amount = grand_total - paid_amount;
    let payment_status = "PAID";
    if (due_amount > 0) {
      payment_status = paid_amount > 0 ? "PARTIAL" : "DUE";
    }

    // 💾 SAVE INVOICE
    const invoice = await Invoice.create({
      invoice_number,
      invoiceDate,
      customer: customerId,
      customer_name,
      customer_mobile,
      items: formattedItems,
      sub_total,
      discount,
      gst_enabled,
      gst_rate,
      gst_amount,
      paid_amount,
      due_amount,
      payment_status,
      grand_total,
      created_by: req.user.id,
    });

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 📄 GET ALL INVOICES
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customer")
      .sort({ createdAt: -1 });

    res.json({ invoices });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message,
    });
  }
};

// 🔍 GET SINGLE INVOICE
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("customer");

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json({ invoice });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoice",
      error: error.message,
    });
  }
};

const getInvoicesByCustomer = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      customer: req.params.customerId,
    }).sort({
      createdAt: -1,
    });

    res.json({
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching customer invoices",

      error: error.message,
    });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const {
      customer_name,
      customer_mobile,
      customer,
      items = [],
      discount = 0,
      gst_enabled = false,
      gst_rate = 0,
      paid_amount = 0,
      invoiceDate,
    } = req.body;

    // 🔥 AUTO CUSTOMER CREATE
    let customerId = customer || null;

    // IF CUSTOMER NOT SELECTED  // CREATE NEW CUSTOMER
    if (!customerId) {
      const existingCustomer = await Customer.create({
        customer_name,
        phone: customer_mobile,
      });
      customerId  = existingCustomer._id;
    }

    // =========================
    // 1. RESTORE OLD STOCK FIRST
    // =========================
    for (let oldItem of invoice.items) {
      const itemData = await Item.findById(oldItem.item_id);
      if (itemData) {
        itemData.opening_stock += Number(oldItem.qty || 0);
        await itemData.save();

        await createStockHistory({
          item: itemData._id,
          type: "RETURN",
          qty: oldItem.qty,
          previous_stock: itemData.opening_stock - oldItem.qty,
          new_stock: itemData.opening_stock,
          note: "Invoice Update Restore",
          reference_id: invoice.invoice_number,
          created_by: req.user.id,
        });
      }
    }

    // =========================
    // 2. STOCK VALIDATION (NEW ITEMS)
    // =========================
    const requestedQty = items.reduce((acc, i) => {
      const key = String(i.item_id);
      acc[key] = (acc[key] || 0) + Number(i.qty || 0);
      return acc;
    }, {});

    for (let itemId of Object.keys(requestedQty)) {
      const itemData = await Item.findById(itemId);

      if (!itemData) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (itemData.opening_stock < requestedQty[itemId]) {
        return res.status(400).json({
          message: `${itemData.item_name} only ${itemData.opening_stock} in stock`,
        });
      }
    }

    // =========================
    // 3. APPLY NEW ITEMS + STOCK REDUCE
    // =========================
    let sub_total = 0;
    let formattedItems = [];

    for (let i of items) {
      const itemData = await Item.findById(i.item_id);
      if (!itemData) continue;

      const price = Number(i.price ?? itemData.sales_price);
      const total = price * Number(i.qty);

      sub_total += total;

      formattedItems.push({
        item_id: itemData._id,
        item_name: i.item_name || itemData.item_name,
        qty: Number(i.qty),
        price,
        total,
        serial_number: i.serial_number || "",
      });

      // reduce stock
      itemData.opening_stock -= Number(i.qty);
      await itemData.save();

      await createStockHistory({
        item: itemData._id,
        type: "SALE",
        qty: Number(i.qty),
        previous_stock: itemData.opening_stock + Number(i.qty),
        new_stock: itemData.opening_stock,
        note: "Invoice Update Sale",
        reference_id: invoice.invoice_number,
        created_by: req.user.id,
      });
    }

    // =========================
    // 4. CALCULATIONS
    // =========================
    const safeDiscount = Math.min(Number(discount || 0), sub_total);

    const afterDiscount = sub_total - safeDiscount;

    const gstAmount = gst_enabled
      ? (afterDiscount * Number(gst_rate || 0)) / 100
      : 0;

    const grand_total = afterDiscount + gstAmount;
    const due_amount = grand_total - Number(paid_amount || 0);

    let payment_status = "PAID";
    if (due_amount > 0) {
      payment_status = paid_amount > 0 ? "PARTIAL" : "DUE";
    }

    // =========================
    // 5. UPDATE INVOICE (IMPORTANT FIX HERE)
    // =========================
    invoice.customer_name = customer_name?.trim() || "Cash";
    invoice.customer_mobile = customer_mobile || "";
    invoice.customer = customerId;
    invoice.items = formattedItems;

    invoice.sub_total = sub_total;
    invoice.discount = safeDiscount;
    invoice.gst_enabled = gst_enabled;
    invoice.gst_rate = gst_rate;
    invoice.gst_amount = gstAmount;

    invoice.grand_total = grand_total;
    invoice.paid_amount = Number(paid_amount || 0);
    invoice.due_amount = due_amount;
    invoice.payment_status = payment_status;

    invoice.invoiceDate = invoiceDate || invoice.invoiceDate || new Date();

    await invoice.save();

    return res.json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    for (let oldItem of invoice.items) {
      const item = await Item.findById(oldItem.item_id);

      if (item) {
        item.opening_stock += Number(oldItem.qty || 0);
        await item.save();

        await createStockHistory({
          item: item._id,
          type: "RETURN",
          qty: Number(oldItem.qty || 0),
          previous_stock: item.opening_stock - Number(oldItem.qty || 0),
          new_stock: item.opening_stock,
          note: "Invoice Deleted",
          reference_id: invoice.invoice_number,
          created_by: req.user.id,
        });
      }
    }

    await Invoice.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Invoice deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting invoice",
      error: error.message,
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  getInvoicesByCustomer,
  updateInvoice,
  deleteInvoice,
};
