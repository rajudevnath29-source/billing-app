const Purchase = require("../models/Purchase");
const Item = require("../models/Item");

// ======================================
// 🧾 CREATE PURCHASE
// ======================================

const createPurchase = async (req, res) => {

  try {

    const {
      supplier_name,
      supplier_mobile,
      items,
      discount = 0,
      gst_enabled = false,
      gst_rate = 0
    } = req.body;

    // VALIDATION
    if (!items || items.length === 0) {

      return res.status(400).json({
        message: "Items required"
      });

    }

    let sub_total = 0;

    let formattedItems = [];

    // ==================================
    // 🔥 PROCESS ITEMS
    // ==================================

    for (let i of items) {

      const itemData =
        await Item.findById(i.item_id);

      if (!itemData) {

        return res.status(404).json({
          message: "Item not found"
        });

      }

      // TOTAL
      const total =
        Number(i.purchase_price) *
        Number(i.qty);

      sub_total += total;

      formattedItems.push({

        item_id: itemData._id,

        item_name:
          itemData.item_name,

        qty: i.qty,

        purchase_price:
          i.purchase_price,

        total

      });

      // ==================================
      // 🔥 STOCK INCREASE
      // ==================================

      itemData.opening_stock +=
        Number(i.qty);

      // UPDATE PURCHASE PRICE
      itemData.purchase_price =
        i.purchase_price;

      await itemData.save();

    }

    // ==================================
    // 💰 CALCULATIONS
    // ==================================

    const afterDiscount =
      sub_total - Number(discount);

    let gst_amount = 0;

    if (gst_enabled) {

      gst_amount =
        (afterDiscount * gst_rate) / 100;

    }

    const grand_total =
      afterDiscount + gst_amount;

    // ==================================
    // 🔥 AUTO PURCHASE NUMBER
    // ==================================

    const count =
      await Purchase.countDocuments();

    const purchase_number =
      `PUR-${String(count + 1).padStart(4, "0")}`;

    // ==================================
    // 💾 SAVE PURCHASE
    // ==================================

    const purchase =
      await Purchase.create({

        purchase_number,

        supplier_name,

        supplier_mobile,

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

      message:
        "Purchase created successfully",

      purchase

    });

  } catch (error) {

    res.status(500).json({

      message: "Server error",

      error: error.message

    });

  }

};

// ======================================
// 📄 GET PURCHASES
// ======================================

const getPurchases = async (req, res) => {

  try {

    const purchases =
      await Purchase.find()

      .sort({ createdAt: -1 });

    res.json({ purchases });

  } catch (error) {

    res.status(500).json({

      message:
        "Error fetching purchases",

      error: error.message

    });

  }

};

module.exports = {

  createPurchase,

  getPurchases

};