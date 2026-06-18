const Invoice = require("../models/Invoice");
const Item = require("../models/Item");
const Customer = require("../models/Customer");
const GstSettings = require("../models/GstSettings");
const GstLedger = require("../models/GstLedger");
const createStockHistory = require("../utils/createStockHistory");
const {
  isSameState,
  canDetermineGstType,
  getPlaceOfSupply,
} = require("../utils/gstHelper");
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
      gst_rate = 18,
      paid_amount = 0,
      invoiceDate = new Date(),
      isBulk = false,
    } = req.body;

    // VALIDATION
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Items required",
      });
    }
    
    // 🔥 AUTO CUSTOMER CREATE / FIND
    let customerId = customer || null;

    if (!customerId) {
      // Bulk upload me pehle customer find karo
      if (isBulk) {
        const existingCustomer = await Customer.findOne({
          customer_name: customer_name?.trim(),
        });

        if (existingCustomer) {
          customerId = existingCustomer._id;
        } else {
          const newCustomer = await Customer.create({
            customer_name,
            phone: customer_mobile,
          });

          customerId = newCustomer._id;
        }
      } else {
        // Normal invoice behaviour
        const newCustomer = await Customer.create({
          customer_name,
          phone: customer_mobile,
        });

        customerId = newCustomer._id;
      }
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

    if (!isBulk) {
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

      if (!isBulk) {
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
    }

    // 💰 CALCULATIONS
    const afterDiscount = sub_total - Number(discount);
    let gst_amount = 0;
    let cgst_amount = 0;
    let sgst_amount = 0;
    let igst_amount = 0;
    let gst_type = "NONE";
    let place_of_supply = "";

    const customerData = await Customer.findById(customerId);

    if (gst_enabled) {
      const gstSettings = await GstSettings.findOne();

      if (canDetermineGstType(gstSettings, customerData)) {
        place_of_supply = getPlaceOfSupply(customerData);

        if (isSameState(gstSettings, customerData)) {
          gst_type = "INTRA";
          cgst_amount = (afterDiscount * gst_rate) / 200;
          sgst_amount = cgst_amount;
          gst_amount = cgst_amount + sgst_amount;
        } else {
          gst_type = "INTER";
          igst_amount = (afterDiscount * gst_rate) / 100;
          gst_amount = igst_amount;
        }
      } else {
        gst_type = "NONE";
        gst_amount = 0;
      }
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
      customer_gstin: customerData?.gst_number || "",
      items: formattedItems,
      sub_total,
      discount,
      gst_enabled,
      gst_rate,
      gst_amount,
      cgst_amount,
      sgst_amount,
      igst_amount,
      gst_type,
      place_of_supply,
      paid_amount,
      due_amount,
      payment_status,
      isBulk: isBulk ? true : false,
      grand_total,
      created_by: req.user.id,
    });

    // =========================
    // 📊 STORE OUTPUT GST IN LEDGER
    // =========================
    if (gst_enabled && gst_amount > 0) {
      const parsedInvoiceDate = new Date(invoiceDate);
      const month = parsedInvoiceDate.toLocaleString("en-US", { month: "long" });
      const year = parsedInvoiceDate.getFullYear();

      await GstLedger.create({
        transaction_type: "OUTPUT",
        transaction_id: invoice._id,
        transaction_number: invoice_number,
        transaction_date: parsedInvoiceDate,
        party_name: customer_name,
        party_gstin: customerData?.gst_number || "",
        taxable_amount: afterDiscount,
        cgst_amount: cgst_amount,
        sgst_amount: sgst_amount,
        igst_amount: igst_amount,
        total_gst: gst_amount,
        gst_rate: gst_rate,
        gst_type: gst_type,
        place_of_supply: place_of_supply,
        month: month,
        year: year,
      });
    }

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
      customerId = existingCustomer._id;
    }
    if (!invoice.isBulk) {
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
    }
    // =========================
    // 2. STOCK VALIDATION (NEW ITEMS)
    // =========================
    const requestedQty = items.reduce((acc, i) => {
      const key = String(i.item_id);
      acc[key] = (acc[key] || 0) + Number(i.qty || 0);
      return acc;
    }, {});

    if (!invoice.isBulk) {
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

      if (!invoice.isBulk) {
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
    }
    // =========================
    // 4. CALCULATIONS
    // =========================
    const safeDiscount = Math.min(Number(discount || 0), sub_total);

    const afterDiscount = sub_total - safeDiscount;

    let gstAmount = 0;
    let cgst_amount = 0;
    let sgst_amount = 0;
    let igst_amount = 0;
    let gst_type = "NONE";
    let place_of_supply = "";

    const customerData = await Customer.findById(customerId);

    if (gst_enabled) {
      const gstSettings = await GstSettings.findOne();

      if (canDetermineGstType(gstSettings, customerData)) {
        place_of_supply = getPlaceOfSupply(customerData);

        if (isSameState(gstSettings, customerData)) {
          gst_type = "INTRA";
          cgst_amount = (afterDiscount * Number(gst_rate || 0)) / 200;
          sgst_amount = cgst_amount;
          gstAmount = cgst_amount + sgst_amount;
        } else {
          gst_type = "INTER";
          igst_amount = (afterDiscount * Number(gst_rate || 0)) / 100;
          gstAmount = igst_amount;
        }
      } else {
        gst_type = "NONE";
        gstAmount = 0;
      }
    }

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
    invoice.customer_gstin = customerData?.gst_number || "";
    invoice.items = formattedItems;

    invoice.sub_total = sub_total;
    invoice.discount = safeDiscount;
    invoice.gst_enabled = gst_enabled;
    invoice.gst_rate = gst_rate;
    invoice.gst_amount = gstAmount;
    invoice.cgst_amount = cgst_amount;
    invoice.sgst_amount = sgst_amount;
    invoice.igst_amount = igst_amount;
    invoice.gst_type = gst_type;
    invoice.place_of_supply = place_of_supply;

    invoice.grand_total = grand_total;
    invoice.paid_amount = Number(paid_amount || 0);
    invoice.due_amount = due_amount;
    invoice.payment_status = payment_status;

    invoice.invoiceDate = invoiceDate || invoice.invoiceDate || new Date();

    await invoice.save();

    // =========================
    // 📊 UPDATE OUTPUT GST IN LEDGER
    // =========================
    if (gst_enabled && gstAmount > 0) {
      const existingLedger = await GstLedger.findOne({
        transaction_id: invoice._id,
        transaction_type: "OUTPUT",
      });

      const invoiceDate = new Date(invoice.invoiceDate || invoice.createdAt);
      const month = invoiceDate.toLocaleString("en-US", { month: "long" });
      const year = invoiceDate.getFullYear();

      if (existingLedger) {
        existingLedger.taxable_amount = afterDiscount;
        existingLedger.cgst_amount = cgst_amount;
        existingLedger.sgst_amount = sgst_amount;
        existingLedger.igst_amount = igst_amount;
        existingLedger.total_gst = gstAmount;
        existingLedger.gst_rate = gst_rate;
        existingLedger.gst_type = gst_type;
        existingLedger.place_of_supply = place_of_supply;
        existingLedger.party_gstin = customerData?.gst_number || "";
        await existingLedger.save();
      } else {
        await GstLedger.create({
          transaction_type: "OUTPUT",
          transaction_id: invoice._id,
          transaction_number: invoice.invoice_number,
          transaction_date: invoiceDate,
          party_name: customer_name,
          party_gstin: customerData?.gst_number || "",
          taxable_amount: afterDiscount,
          cgst_amount: cgst_amount,
          sgst_amount: sgst_amount,
          igst_amount: igst_amount,
          total_gst: gstAmount,
          gst_rate: gst_rate,
          gst_type: gst_type,
          place_of_supply: place_of_supply,
          month: month,
          year: year,
        });
      }
    }

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
    if (!invoice.isBulk) {
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
