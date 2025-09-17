// models/History.js
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
    enum: [
      // Content actions
      'CREATE_CONTENT', 'UPDATE_CONTENT', 'DELETE_CONTENT', 'VIEW_CONTENT',
      // Gallery actions  
      'CREATE_GALLERY', 'UPDATE_GALLERY', 'DELETE_GALLERY', 'VIEW_GALLERY', 'VIEW_GALLERY_ADMIN',
      // Contact actions
      'CREATE_CONTACT', 'UPDATE_CONTACT', 'DELETE_CONTACT', 'VIEW_CONTACT',
      // Admin actions
      'UPDATE_ADMIN_SETTINGS', 'VIEW_ADMIN_SETTINGS',
      // Auth actions
      'LOGIN', 'LOGOUT', 'REGISTER'
    ]
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for system actions
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Store any additional data
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for better query performance
historySchema.index({ createdAt: -1 });
historySchema.index({ actionType: 1 });
historySchema.index({ user: 1 });

module.exports = mongoose.model('History', historySchema);