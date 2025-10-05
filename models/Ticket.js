const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'breached'],
    default: 'open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deadline: {
    type: Date,
    required: true
  },
  version: {
    type: Number,
    default: 0
  },
  idempotencyKey: {
    type: String,
    sparse: true,
    unique: true
  }
}, {
  timestamps: true
});

// Calculate SLA deadline based on priority
ticketSchema.pre('save', function(next) {
  if (this.isNew && !this.deadline) {
    const now = new Date();
    const slaHours = {
      urgent: 4,
      high: 8,
      medium: 24,
      low: 72
    };
    
    this.deadline = new Date(now.getTime() + (slaHours[this.priority] * 60 * 60 * 1000));
  }
  next();
});

// Indexes for better query performance
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ deadline: 1 });
ticketSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Ticket', ticketSchema);