const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const roleMiddleware =
  require("../middleware/roleMiddleware");

const {

  createPurchase,
  getPurchases

} = require("../controllers/purchaseController");

// ====================================
// 🧾 CREATE PURCHASE
// ====================================

router.post(

  "/",

  authMiddleware,

  roleMiddleware([
    "SUPER_ADMIN",
    "ITEM_MANAGER"
  ]),

  createPurchase

);

// ====================================
// 📄 GET PURCHASES
// ====================================

router.get(

  "/",

  authMiddleware,

  getPurchases

);

module.exports = router;