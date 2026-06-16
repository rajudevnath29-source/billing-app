const express = require("express");
const router = express.Router();
const {
  getGstSettings,
  updateGstSettings,
} = require("../controllers/gstSettingsController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getGstSettings);
router.put("/", authMiddleware, updateGstSettings);

module.exports = router;
