const Item = require("../models/Item");

// CREATE ITEM
exports.createItem = async (req, res) => {
  try {
    const {
      item_name,
      unit,
      sales_price,
      purchase_price,
      opening_stock,
      low_stock_alert,
      image,
      hsn_code,
      gst_rate
    } = req.body;

    const item = await Item.create({
      item_name,
      unit,
      sales_price,
      purchase_price,
      opening_stock,
      low_stock_alert,
      image,
      hsn_code: hsn_code || "",
      gst_rate: gst_rate || 18
    });

    res.status(201).json({
      message: "Item created successfully",
      item
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET ALL ITEMS
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ created_at: -1 });

    res.json({
      message: "Items fetched successfully",
      items
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET SINGLE ITEM
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    res.json({ item });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// UPDATE ITEM
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({
      message: "Item updated successfully",
      item: updatedItem
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating item",
      error: error.message
    });
  }
};


// DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    res.json({
      message: "Item deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};