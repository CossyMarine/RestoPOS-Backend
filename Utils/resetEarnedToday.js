import Wallet from "../models/Wallet.js";
import { getUserLocalDate } from "./timeUtils.js";

// Call before any earn action — resets earnedToday if user's local date changed
export const maybeResetEarnedToday = async (userId, timezone = "UTC") => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) return null;
  const todayStr = getUserLocalDate(timezone);
  if (wallet.earnedTodayDate !== todayStr) {
    wallet.earnedToday = 0;
    wallet.earnedTodayDate = todayStr;
    await wallet.save();
  }
  return wallet;
};
