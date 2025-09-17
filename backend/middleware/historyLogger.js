// middleware/historyLogger.js
const History = require("../models/History");

const logHistory = async (actionType, description, data = null, userId = null) => {
  try {
    const history = new History({
      actionType,
      description,
      data,
      user: userId,
    });
    await history.save();
    console.log(`📝 History logged: ${actionType}`);
  } catch (error) {
    console.error("❌ Error logging history:", error);
  }
};

// Middleware to automatically log admin actions
const historyMiddleware = (actionType, getDescription) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to log after successful response
    res.json = function(data) {
      // Only log if response is successful (status < 400)
      if (res.statusCode < 400) {
        const userId = req.user ? req.user.id : null;
        const description = typeof getDescription === 'function' 
          ? getDescription(req, data) 
          : getDescription;
        
        // Log history asynchronously (don't block response)
        setImmediate(() => {
          logHistory(actionType, description, {
            requestBody: req.body,
            responseData: data,
            method: req.method,
            url: req.originalUrl,
          }, userId);
        });
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Helper function for manual history logging
const addHistory = logHistory;

module.exports = {
  historyMiddleware,
  addHistory,
};