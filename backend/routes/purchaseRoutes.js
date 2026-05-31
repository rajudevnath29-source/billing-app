const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase
} = require("../controllers/purchaseController");

// ====================================
// 🧾 CREATE PURCHASE
// ====================================

router.post("/", authMiddleware, permissionMiddleware("CREATE_PURCHASE"), createPurchase);

// ====================================
// 📄 GET PURCHASES
// ====================================

router.get("/", authMiddleware, getPurchases);

router.get("/:id", authMiddleware, permissionMiddleware("VIEW_PURCHASE"), getPurchaseById);

router.put("/:id", authMiddleware, permissionMiddleware("EDIT_PURCHASE"), updatePurchase);

router.delete("/:id", authMiddleware, permissionMiddleware("DELETE_PURCHASE"), deletePurchase);

module.exports = router;
