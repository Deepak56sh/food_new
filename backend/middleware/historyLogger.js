// middleware/historyLogger.js
const History = require("../models/History");

const logHistory = async (actionType, description, data = null, userId = null, ipAddress = null) => {
  try {
    const history = new History({
      actionType,
      description, // readable text (Banner updated, Image added, etc.)
      data,
      user: userId,
      ipAddress
    });
    await history.save();
    console.log(`📝 History logged: ${description}`);
  } catch (error) {
    console.error("❌ Error logging history:", error);
  }
};

const historyMiddleware = (actionType, description) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
      if (res.statusCode < 400) {
        const userId = req.user ? req.user.id : null;
        const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";

        const desc = typeof description === "function" ? description(req, data) : description;

        setImmediate(() => {
          logHistory(actionType, desc, null, userId, ipAddress);
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = { historyMiddleware, addHistory: logHistory };
