const StockHistory = require("../models/StockHistory");

// ======================================
// 📄 GET STOCK HISTORY
// ======================================
const getStockHistory = async (req, res) => {
  try {
    const history = await StockHistory.find()
      .populate("item", "item_name")
      .sort({ createdAt: -1 });

    res.json({
      message: "Stock history fetched successfully",
      history,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching stock history",
      error: error.message,
    });
  }
};

module.exports = {
  getStockHistory,
};
