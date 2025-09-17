// middleware/historyLogger.js
const History = require("../models/History");

const logHistory = async (actionType, description, data = null, userId = null, ipAddress = null) => {
  try {
    const history = new History({
      actionType,
      description,
      data,
      user: userId,
      ipAddress
    });
    await history.save();
    console.log(`📝 History logged: ${actionType} - ${description}`);
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
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
        
        let description;
        if (typeof getDescription === 'function') {
          try {
            const result = getDescription(req, data);
            // Handle Promise from async function
            if (result && typeof result.then === 'function') {
              result.then(desc => {
                logHistory(actionType, desc, {
                  method: req.method,
                  url: req.originalUrl,
                  userAgent: req.get('User-Agent')
                }, userId, ipAddress);
              }).catch(err => {
                console.error('Error in description function:', err);
                logHistory(actionType, `Action completed - ID: ${req.params.id || 'N/A'}`, {
                  method: req.method,
                  url: req.originalUrl
                }, userId, ipAddress);
              });
              return originalJson.call(this, data);
            } else {
              description = result;
            }
          } catch (error) {
            console.error('Error in description function:', error);
            description = `Action completed - ID: ${req.params.id || 'N/A'}`;
          }
        } else {
          description = getDescription;
        }
        
        // Log history asynchronously (don't block response)
        setImmediate(() => {
          logHistory(actionType, description, {
            method: req.method,
            url: req.originalUrl,
            userAgent: req.get('User-Agent')
          }, userId, ipAddress);
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