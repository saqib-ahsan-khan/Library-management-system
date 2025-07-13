const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  borrowDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed'
  },
  fine: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate due date (14 days from borrow date)
borrowSchema.pre('save', function(next) {
  if (!this.dueDate) {
    this.dueDate = new Date(this.borrowDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days
  }
  next();
});

// Virtual for checking if book is overdue
borrowSchema.virtual('isOverdue').get(function() {
  if (this.status === 'returned') return false;
  return new Date() > this.dueDate;
});

// Virtual for calculating days overdue
borrowSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'returned' || !this.isOverdue) return 0;
  const now = new Date();
  const diffTime = now - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are serialized
borrowSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Borrow', borrowSchema, 'borrowings'); 