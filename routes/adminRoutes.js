import { Router } from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import restrictTo from "../Middlewares/roleMiddleware.js";
import {
  getAllUsers,
  blockUser,
  changeRole,
  assignBadge,
  updateAdminPermissions,
  getAnalytics,
  getSettings,
  updateSettings,
  updateBadgeTiers,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  createPoll,
  closePoll,
  deletePoll,
  handleCheckIn,
} from "../Controllers/AdminController.js";
import {
  editWalletBalance,
  processWithdrawal,
} from "../Controllers/WalletController.js";

const router = Router();

// ── User management ──────────────────────────────────────────────
router.get("/users", protect, restrictTo("admin", "superadmin"), getAllUsers);
router.put("/block-user", protect, restrictTo("admin", "superadmin"), blockUser);
router.put("/change-role", protect, restrictTo("superadmin"), changeRole);
router.put("/assign-badge", protect, restrictTo("admin", "superadmin"), assignBadge);
router.put("/admin-permissions", protect, restrictTo("superadmin"), updateAdminPermissions);

// ── Analytics & settings ─────────────────────────────────────────
router.get("/analytics", protect, restrictTo("admin", "superadmin"), getAnalytics);
router.get("/settings", protect, restrictTo("admin", "superadmin"), getSettings);
router.put("/settings", protect, restrictTo("admin", "superadmin"), updateSettings);
router.put("/badge-tiers", protect, restrictTo("admin", "superadmin"), updateBadgeTiers);

// ── Announcements ────────────────────────────────────────────────
router.post("/announcements", protect, restrictTo("admin", "superadmin"), addAnnouncement);
router.put("/announcements/:id", protect, restrictTo("admin", "superadmin"), updateAnnouncement);
router.delete("/announcements/:id", protect, restrictTo("admin", "superadmin"), deleteAnnouncement);

// ── Polls ────────────────────────────────────────────────────────
router.post("/polls", protect, restrictTo("admin", "superadmin"), createPoll);
router.put("/polls/:id/close", protect, restrictTo("admin", "superadmin"), closePoll);
router.delete("/polls/:id", protect, restrictTo("admin", "superadmin"), deletePoll);

// ── Wallet management ────────────────────────────────────────────
router.put("/wallet/edit", protect, restrictTo("admin", "superadmin"), editWalletBalance);
router.put("/wallet/process-withdrawal", protect, restrictTo("admin", "superadmin"), processWithdrawal);

// ── Daily check-in (any logged-in user) ─────────────────────────
router.post("/daily-checkin", protect, handleCheckIn);

export default router;
