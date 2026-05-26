const express = require("express");
const router = express.Router();

const { getStockHistory } = require("../controllers/stockHistoryController");

router.get("/", getStockHistory);

module.exports = router;
