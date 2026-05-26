const Invoice = require("../models/Invoice");
const Item = require("../models/Item");

// 🔥 CREATE INVOICE (GST + NO GST + STOCK UPDATE)
const createInvoice = async (req, res) => {
  try {
    const {
      customer_name,
      customer_mobile,
      items,
      discount = 0,
      gst_enabled = false,
      gst_rate = 0
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    let sub_total = 0;
    let formattedItems = [];

    // 🔁 PROCESS ITEMS
    for (let i of items) {
      const itemData = await Item.findById(i.item_id);

      if (!itemData) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (itemData.opening_stock < i.qty) {
        return res.status(400).json({
          message: `${itemData.item_name} out of stock`
        });
      }

      const total = itemData.sales_price * i.qty;
      sub_total += total;

      formattedItems.push({
        item_id: itemData._id,
        item_name: itemData.item_name,
        qty: i.qty,
        price: itemData.sales_price,
        total
      });

      // 🔥 STOCK REDUCE
      itemData.opening_stock -= i.qty;
      await itemData.save();
    }

    // 💰 CALCULATION
    const afterDiscount = sub_total - discount;

    let gst_amount = 0;
    if (gst_enabled) {
      gst_amount = (afterDiscount * gst_rate) / 100;
    }

    const grand_total = afterDiscount + gst_amount;

    // 🧾 AUTO INVOICE NUMBER
    const count = await Invoice.countDocuments();
    const invoice_number = `INV-${String(count + 1).padStart(4, "0")}`;

    // 💾 SAVE INVOICE
    const invoice = await Invoice.create({
      invoice_number,
      customer_name,
      customer_mobile,
      items: formattedItems,
      sub_total,
      discount,
      gst_enabled,
      gst_rate,
      gst_amount,
      grand_total,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Invoice created successfully",
      invoice
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// 📄 GET ALL INVOICES
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 });

    res.json({ invoices });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message
    });
  }
};

// 🔍 GET SINGLE INVOICE
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    res.json({ invoice });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoice",
      error: error.message
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById
};