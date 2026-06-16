const express = require("express");
const router = express.Router();
const { getGstLiability } = require("../controllers/gstLiabilityController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getGstLiability);

module.exports = router;
