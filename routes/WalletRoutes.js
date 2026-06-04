import { Router } from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import { getWallet, deposit, withdraw, getTransactions, getWithdrawalHistory } from "../Controllers/WalletController.js";

const router = Router();

router.get("/", protect, getWallet);
router.post("/deposit", protect, deposit);
router.post("/withdraw", protect, withdraw);
router.get("/transactions", protect, getTransactions);
router.get("/withdrawals", protect, getWithdrawalHistory);

export default router;
