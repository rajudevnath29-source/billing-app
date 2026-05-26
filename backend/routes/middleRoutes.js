const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ONLY LOGGED IN USERS
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "User profile data",
    user: req.user
  });
});

// ONLY SUPER ADMIN CAN ACCESS
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  (req, res) => {
    res.json({
      message: "Welcome Admin Panel"
    });
  }
);

module.exports = router;