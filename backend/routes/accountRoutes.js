const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  createAccount,
  getAccounts,
  deleteAccount,
} = require("../controllers/accountController");

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("CREATE_ACCOUNT"),
  createAccount,
);

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("VIEW_ACCOUNT"),
  getAccounts,
);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("DELETE_ACCOUNT"),
  deleteAccount,
);

module.exports = router;
