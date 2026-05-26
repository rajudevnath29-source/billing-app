const StockHistory = require("../models/StockHistory");

const createStockHistory = async ({
  item,
  type,
  qty,
  previous_stock,
  new_stock,
  note = "",
  reference_id = "",
  created_by,
}) => {
  try {
    return await StockHistory.create({
      item,
      type,
      qty,
      previous_stock,
      new_stock,
      note,
      reference_id,
      created_by,
    });
  } catch (error) {
    console.log("Stock History Error:", error.message);
  }
};

module.exports = createStockHistory;
