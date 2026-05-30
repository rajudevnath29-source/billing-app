const Purchase = require("../models/Purchase");
const Item = require("../models/Item");
const createStockHistory = require("../utils/createStockHistory");

// ======================================
// 🧾 CREATE PURCHASE
// ======================================
const createPurchase = async (req, res) => {
  try {
    const {
      supplier_name,
      supplier_mobile,
      items,
      gst_enabled = false,
      gst_rate = 0,
    } = req.body;

    // VALIDATION
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    let sub_total = 0;
    let formattedItems = [];

    // ==================================
    // 🔥 AUTO PURCHASE NUMBER (FIXED POSITION)
    // ==================================
    const count = await Purchase.countDocuments();
    const purchase_number = `PUR-${String(count + 1).padStart(4, "0")}`;

    // ==================================
    // 🔥 PROCESS ITEMS
    // ==================================
    for (let i of items) {
      const itemData = await Item.findById(i.item_id);

      if (!itemData) {
        return res.status(404).json({ message: "Item not found" });
      }

      const qty = Number(i.qty);
      const purchasePrice = Number(i.purchase_price);

      const total = purchasePrice * qty;
      sub_total += total;

      formattedItems.push({
        item_id: itemData._id,
        item_name: itemData.item_name,
        qty,
        purchase_price: purchasePrice,
        total,
        serial_numbers: i.serial_numbers || [],
      });

      // ==================================
      // 📦 STOCK UPDATE
      // ==================================
      const previousStock = itemData.opening_stock;

      itemData.opening_stock += qty;
      await itemData.save();

      // ==================================
      // 🧾 STOCK HISTORY
      // ==================================
      await createStockHistory({
        item: itemData._id,
        type: "PURCHASE",
        qty,
        previous_stock: previousStock,
        new_stock: itemData.opening_stock,
        note: "Purchase Entry",
        reference_id: purchase_number,
        created_by: req.user.id,
      });

      // ==================================
      // 💰 UPDATE PURCHASE PRICE
      // ==================================
      itemData.purchase_price = purchasePrice;
      await itemData.save();
    }

    // ==================================
    // 💰 CALCULATIONS
    // ==================================
    let gst_amount = 0;

    if (gst_enabled) {
      gst_amount = (sub_total * gst_rate) / 100;
    }

    const grand_total = sub_total + gst_amount;

    // ==================================
    // 💾 SAVE PURCHASE
    // ==================================
    const purchase = await Purchase.create({
      purchase_number,
      supplier_name,
      supplier_mobile,
      items: formattedItems,
      sub_total,
      gst_enabled,
      gst_rate,
      gst_amount,
      grand_total,
      created_by: req.user.id,
    });

    return res.status(201).json({
      message: "Purchase created successfully",
      purchase,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================
// 📄 GET PURCHASES
// ======================================
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("items.item_id")
      .sort({ createdAt: -1 });

    return res.json({
      message: "Purchases fetched successfully",
      purchases,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching purchases",
      error: error.message,
    });
  }
};

module.exports = {
  createPurchase,
  getPurchases,
};
