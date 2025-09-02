const mongoose = require("mongoose");
const Campaign = require("../models/Campaign");
const Settings = require("../models/Settings");
const Wallet = require("../models/Wallet");
const WalletTx = require("../models/WalletTransaction");

// Utility to load settings once (simple helper)
async function getSettings() {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return s;
}

// 1) Create Draft Campaign (no activation yet)
exports.createCampaign = async (req, res) => {
  try {
    const { title, description, category, payPerTask, maxEarners, perUserLimit = 1, instructions, targetUrl, expiresAt } = req.body;
    const settings = await getSettings();

    // enforce minimums
    const catMin = settings.categoryMinimums.get(category) ?? settings.minPayGlobal;
    if (payPerTask < catMin) {
      'return res.status(400).json({ message: Minimum pay for ${category} is ${catMin.toFixed(2)} })';
    }

    const feePct = settings.platformFeePct; // snapshot
    const payoutBudget = payPerTask * maxEarners;
    const feeAmount = (payoutBudget * feePct) / 100;
    const escrowRequired = payoutBudget + feeAmount;

    const campaign = await Campaign.create({
      title, description, category, payPerTask, platformFeePctAtCreate: feePct,
      maxEarners, perUserLimit, instructions, targetUrl,
      poster: req.user._id,
      payoutBudget, feeAmount, escrowRequired,
      status: "draft",
      approvalsCloseAt: new Date(Date.now() + settings.autoApproveDays * 24*60*60*1000),
      expiresAt
    });

    res.status(201).json(campaign);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 2) Fund & Activate (moves deposit to escrow)
exports.fundAndActivate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const campaign = await Campaign.findById(req.params.id).session(session);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.poster.toString() !== req.user._id.toString()) throw new Error("Not campaign owner");
    if (campaign.status !== "draft" && campaign.status !== "paused") throw new Error("Campaign not in fundable state");

    const wallet = await Wallet.findOne({ user: req.user._id }).session(session);
    if (!wallet) throw new Error("Wallet not found");

    if (wallet.available < campaign.escrowRequired) throw new Error("Insufficient funds. Please deposit.");

    // lock escrow
    wallet.available -= campaign.escrowRequired;
    wallet.locked += campaign.escrowRequired;
    await wallet.save({ session });

    await WalletTx.create([{
      user: req.user._id, type: "escrow_lock", amount: -campaign.escrowRequired,
      meta: { campaignId: campaign._id }
    }], { session });

    campaign.status = "active";
    campaign.escrowLocked = campaign.escrowRequired;
    await campaign.save({ session });

    await session.commitTransaction();
    res.json({ message: "Campaign funded & activated", campaign });
  } catch (e) {
    await session.abortTransaction();
    res.status(400).json({ message: e.message });
  } finally {
    session.endSession();
  }
};

// 3) Pause/Resume/Stop (owner)
exports.pauseCampaign = async (req, res) => {
  try {
    const c = await Campaign.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "Not found" });
    if (c.poster.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });
    if (c.status !== "active") return res.status(400).json({ message: "Only active campaigns can be paused" });
    c.status = "paused";
    await c.save();
    res.json({ message: "Paused", campaign: c });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.resumeCampaign = async (req, res) => {
  try {
    const c = await Campaign.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "Not found" });
    if (c.poster.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });
    if (c.status !== "paused") return res.status(400).json({ message: "Only paused campaigns can be resumed" });
    c.status = "active";
    await c.save();
    res.json({ message: "Resumed", campaign: c });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.stopCampaign = async (req, res) => {
  // Stop + refund remaining escrow (unused payout + fee balance)
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const c = await Campaign.findById(req.params.id).session(session);
    if (!c) throw new Error("Not found");
    if (c.poster.toString() !== req.user._id.toString()) throw new Error("Forbidden");
    if (!["active","paused"].includes(c.status)) throw new Error("Only active/paused can be stopped");

    // Compute consumed payout: approvedCount * payPerTask
    const consumedPayout = c.approvedCount * c.payPerTask;
    // consumed fee proportional to consumed payout vs budget
    const feeConsumed = (consumedPayout / c.payoutBudget) * c.feeAmount;
    const lockedToRelease = c.escrowLocked - (consumedPayout + feeConsumed);

    const wallet = await Wallet.findOne({ user: c.poster }).session(session);
    wallet.locked -= lockedToRelease;
    wallet.available += lockedToRelease;
    await wallet.save({ session });

    await WalletTx.create([{
      user: c.poster, type: "escrow_release", amount: lockedToRelease,
      meta: { campaignId: c._id }
    }], { session });

    c.status = "stopped";
    c.escrowLocked -= lockedToRelease;
    await c.save({ session });

    await session.commitTransaction();
    res.json({ message: "Stopped & remaining escrow released", campaign: c });
  } catch (e) {
    await session.abortTransaction();
    res.status(400).json({ message: e.message });
  } finally { session.endSession(); }
};

// 4) List active campaigns (with filters)
exports.listActive = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const q = { status: "active" };
    if (category) q.category = category;
    if (search) q.title = { $regex: search, $options: "i" };
    const items = await Campaign.find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-submissions");
    const total = await Campaign.countDocuments(q);
    res.json({ items, page: +page, pages: Math.ceil(total / limit), total });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// 5) Submit proof (earner)
exports.submitProof = async (req, res) => {
  try {
    const { proofText, proofUrl, extraFields } = req.body;
    const c = await Campaign.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "Campaign not found" });
    if (c.status !== "active") return res.status(400).json({ message: "Campaign not active" });
    if (c.completedCount >= c.maxEarners) return res.status(400).json({ message: "Campaign exhausted" });

    // per-user limit
    const already = c.submissions.filter(s => s.user.toString() === req.user._id.toString());
    if (already.length >= c.perUserLimit) return res.status(400).json({ message: "Submission limit reached" });

    // add submission
    c.submissions.push({ user: req.user._id, proofText, proofUrl, extraFields, status: "pending" });
    c.pendingCount += 1;
    await c.save();

    res.status(201).json({ message: "Submitted for review" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// 6) Poster approves/rejects
exports.reviewSubmissionByPoster = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { action, rejectionReason } = req.body; // "approve" | "reject"
    const { id, submissionId } = req.params;

    const c = await Campaign.findById(id).session(session);
    if (!c) throw new Error("Campaign not found");
    if (c.poster.toString() !== req.user._id.toString()) throw new Error("Forbidden");

    const sub = c.submissions.id(submissionId);
    if (!sub) throw new Error("Submission not found");
    if (sub.status !== "pending") throw new Error("Already reviewed");

    if (action === "reject") {
      if (!rejectionReason) throw new Error("Rejection reason required");
      sub.status = "rejected";
      sub.rejectionReason = rejectionReason;
      sub.reviewedBy = req.user._id;
      sub.reviewedAt = new Date();
      c.pendingCount -= 1;
      c.rejectedCount += 1;
      await c.save({ session });
      await session.commitTransaction();
      return res.json({ message: "Rejected & sent to admin review queue" });
      // (Admin queue behavior is handled when user disputes; see AdminController below)
    }

    if (action !== "approve") throw new Error("Invalid action");

    // approve → pay earner from escrow
    const earnerId = sub.user;
    const wallet = await Wallet.findOne({ user: earnerId }).session(session);
    const posterWallet = await Wallet.findOne({ user: c.poster }).session(session);

    if (c.escrowLocked < c.payPerTask) throw new Error("Escrow underfunded unexpectedly");

    // transfer payout (locked decreases, earner available increases)
    c.escrowLocked -= c.payPerTask;
    wallet.available += c.payPerTask;
    await wallet.save({ session });
    await WalletTx.create([{
      user: earnerId, type: "payout", amount: c.payPerTask,
      meta: { campaignId: c._id, submissionId: sub._id }
    }], { session });

    sub.status = "approved";
    sub.reviewedBy = req.user._id;
    sub.reviewedAt = new Date();
    c.pendingCount -= 1;
    c.approvedCount += 1;
    c.completedCount += 1;

    // auto-exhaust campaign if cap hit
    if (c.completedCount >= c.maxEarners) {
      c.status = "exhausted";
      // release unused remainder (if any fractional rounding, etc.)
      if (c.escrowLocked > 0) {
        posterWallet.locked -= c.escrowLocked;
        posterWallet.available += c.escrowLocked;
        await posterWallet.save({ session });
        await WalletTx.create([{
          user: c.poster, type: "escrow_release", amount: c.escrowLocked,
          meta: { campaignId: c._id, reason: "exhausted" }
        }], { session });
        c.escrowLocked = 0;
      }
    }

    await c.save({ session });
    await session.commitTransaction();
    res.json({ message: "Approved & paid" });
  } catch (e) {
    await session.abortTransaction();
    res.status(400).json({ message: e.message });
  } finally { session.endSession(); }
};

// 7) Auto-approve cron (run daily)
exports.autoApproveOverdue = async () => {
  const settings = await getSettings();
  const cutoff = new Date(Date.now() - settings.autoApproveDays * 24*60*60*1000);
  const campaigns = await Campaign.find({ status: "active" }).select("_id submissions poster payPerTask escrowLocked");
  for (const c of campaigns) {
    // approve any pending submittedAt <= cutoff
    for (const sub of c.submissions) {
      if (sub.status === "pending" && sub.submittedAt <= cutoff) {
        // You will re-use the same logic as in reviewSubmissionByPoster "approve"
        // Typically factor this into a helper to avoid duplication.
      }
    }
    // Save per campaign after processing all auto-approvals
  }
};