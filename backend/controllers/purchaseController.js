const Purchase = require("../models/Purchase");
const Item = require("../models/Item");
const createStockHistory = require("../utils/createStockHistory");
const Counter = require("../models/Counter");

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
    // const count = await Purchase.countDocuments();
    // const purchase_number = `PUR-${String(count + 1).padStart(4, "0")}`;
    const counter = await Counter.findOneAndUpdate(
      { name: "Purchase" },
      { $inc: { value: 1 } },
      { new: true, upsert: true },
    );
    if (!counter.value) {
      counter.value = 1;
    }
    const purchase_number = `PUR-${String(counter.value).padStart(4, "0")}`;

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

const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate(
      "items.item_id",
    );

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    return res.json({
      purchase,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching purchase",
      error: error.message,
    });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    const {
      supplier_name,
      supplier_mobile,
      items,
      gst_enabled = false,
      gst_rate = 0,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    for (let oldItem of purchase.items) {
      const item = await Item.findById(oldItem.item_id);

      if (item) {
        const previousStock = item.opening_stock;
        item.opening_stock = Math.max(
          0,
          previousStock - Number(oldItem.qty || 0),
        );
        await item.save();

        await createStockHistory({
          item: item._id,
          type: "ADJUSTMENT",
          qty: Number(oldItem.qty || 0),
          previous_stock: previousStock,
          new_stock: item.opening_stock,
          note: "Purchase Edit Reversal",
          reference_id: purchase.purchase_number,
          created_by: req.user.id,
        });
      }
    }

    let sub_total = 0;
    const formattedItems = [];

    for (let i of items) {
      const itemData = await Item.findById(i.item_id);

      if (!itemData) {
        return res.status(404).json({ message: "Item not found" });
      }

      const qty = Number(i.qty || 0);
      const purchasePrice = Number(i.purchase_price || 0);
      const total = purchasePrice * qty;
      const previousStock = itemData.opening_stock;

      sub_total += total;

      formattedItems.push({
        item_id: itemData._id,
        item_name: i.item_name || itemData.item_name,
        qty,
        purchase_price: purchasePrice,
        total,
        serial_numbers: i.serial_numbers || [],
      });

      itemData.opening_stock += qty;
      itemData.purchase_price = purchasePrice;
      await itemData.save();

      await createStockHistory({
        item: itemData._id,
        type: "PURCHASE",
        qty,
        previous_stock: previousStock,
        new_stock: itemData.opening_stock,
        note: "Purchase Edited",
        reference_id: purchase.purchase_number,
        created_by: req.user.id,
      });
    }

    const gst_amount = gst_enabled
      ? (sub_total * Number(gst_rate || 0)) / 100
      : 0;

    purchase.supplier_name = supplier_name;
    purchase.supplier_mobile = supplier_mobile;
    purchase.items = formattedItems;
    purchase.sub_total = sub_total;
    purchase.gst_enabled = gst_enabled;
    purchase.gst_rate = gst_rate;
    purchase.gst_amount = gst_amount;
    purchase.grand_total = sub_total + gst_amount;

    await purchase.save();

    return res.json({
      message: "Purchase updated",
      purchase,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating purchase",
      error: error.message,
    });
  }
};

const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    for (let oldItem of purchase.items) {
      const item = await Item.findById(oldItem.item_id);

      if (item) {
        const previousStock = item.opening_stock;
        item.opening_stock = Math.max(
          0,
          previousStock - Number(oldItem.qty || 0),
        );
        await item.save();

        await createStockHistory({
          item: item._id,
          type: "ADJUSTMENT",
          qty: Number(oldItem.qty || 0),
          previous_stock: previousStock,
          new_stock: item.opening_stock,
          note: "Purchase Deleted",
          reference_id: purchase.purchase_number,
          created_by: req.user.id,
        });
      }
    }

    await Purchase.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Purchase deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting purchase",
      error: error.message,
    });
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
};
