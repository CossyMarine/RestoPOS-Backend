const express = require("express");
const router = express.Router();
const { protect } = require("../Middlewares/authMiddleware");
const restrictTo = require("../Middlewares/roleMiddleware");

const {
  getWallet,
  deposit,
  withdraw,
  getTransactions,
  getWithdrawalHistory,
} = require("../Controllers/WalletController");

router.get("/", protect, getWallet);
router.post("/deposit", protect, deposit);
router.post("/withdraw", protect, withdraw);
router.get("/transactions", protect, getTransactions);
router.get("/withdrawals", protect, getWithdrawalHistory);

module.exports = router;