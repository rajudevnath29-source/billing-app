const GstLedger = require("../models/GstLedger");

const getGstLiability = async (req, res) => {
  try {
    const { month, year } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month || new Date().toLocaleString("en-US", { month: "long" });

    const outputGst = await GstLedger.aggregate([
      {
        $match: {
          transaction_type: "OUTPUT",
          month: currentMonth,
          year: currentYear,
        },
      },
      {
        $group: {
          _id: null,
          totalTaxable: { $sum: "$taxable_amount" },
          totalCgst: { $sum: "$cgst_amount" },
          totalSgst: { $sum: "$sgst_amount" },
          totalIgst: { $sum: "$igst_amount" },
          totalGst: { $sum: "$total_gst" },
        },
      },
    ]);

    const inputGst = await GstLedger.aggregate([
      {
        $match: {
          transaction_type: "INPUT",
          month: currentMonth,
          year: currentYear,
        },
      },
      {
        $group: {
          _id: null,
          totalTaxable: { $sum: "$taxable_amount" },
          totalCgst: { $sum: "$cgst_amount" },
          totalSgst: { $sum: "$sgst_amount" },
          totalIgst: { $sum: "$igst_amount" },
          totalGst: { $sum: "$total_gst" },
        },
      },
    ]);

    const outputData = outputGst[0] || {
      totalTaxable: 0,
      totalCgst: 0,
      totalSgst: 0,
      totalIgst: 0,
      totalGst: 0,
    };

    const inputData = inputGst[0] || {
      totalTaxable: 0,
      totalCgst: 0,
      totalSgst: 0,
      totalIgst: 0,
      totalGst: 0,
    };

    const netCgst = outputData.totalCgst - inputData.totalCgst;
    const netSgst = outputData.totalSgst - inputData.totalSgst;
    const netIgst = outputData.totalIgst - inputData.totalIgst;
    const netGstPayable = outputData.totalGst - inputData.totalGst;

    res.json({
      month: currentMonth,
      year: currentYear,
      outputGst: outputData,
      inputGst: inputData,
      netLiability: {
        cgst: netCgst,
        sgst: netSgst,
        igst: netIgst,
        total: netGstPayable,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error calculating GST liability",
      error: error.message,
    });
  }
};

module.exports = {
  getGstLiability,
};
