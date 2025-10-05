const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'assigned', 'sla_breached', 'comment_added', 'status_changed'],
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Index for better query performance
timelineSchema.index({ ticket: 1, timestamp: 1 });

module.exports = mongoose.model('Timeline', timelineSchema);