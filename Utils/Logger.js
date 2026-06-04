import AuditLog from "../models/AuditLog.js";

export const createLog = async (adminId, action, details, ipAddress) => {
  try {
    await AuditLog.create({ admin: adminId, action, details, ipAddress });
  } catch (error) {
    console.error("Audit Log Error:", error.message);
  }
};
