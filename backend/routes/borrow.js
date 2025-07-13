const express = require('express');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');

const router = express.Router();

// Get all borrow records (Admin only)
router.get('/', async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate('user', 'name email studentId')
      .populate('book', 'title author isbn')
      .sort({ borrowDate: -1 });
    res.json(borrows);
  } catch (error) {
    console.error('Get borrows error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get borrow records for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.params.userId })
      .populate('book', 'title author isbn category')
      .sort({ borrowDate: -1 });
    res.json(borrows);
  } catch (error) {
    console.error('Get user borrows error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get borrow records for a specific book
router.get('/book/:bookId', async (req, res) => {
  try {
    const borrows = await Borrow.find({ book: req.params.bookId })
      .populate('user', 'name email studentId')
      .sort({ borrowDate: -1 });
    res.json(borrows);
  } catch (error) {
    console.error('Get book borrows error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Borrow a book
router.post('/', async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    console.log('Borrow request userId:', userId);
    const user = await User.findById(userId);
    console.log('User found:', user);
    const book = await Book.findById(bookId);

    if (!user) {
      return res.status(404).json({ message: `User not found for userId: ${userId}` });
    }

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available for borrowing' });
    }

    // Check if user already has this book borrowed
    const existingBorrow = await Borrow.findOne({
      user: userId,
      book: bookId,
      status: 'borrowed'
    });

    if (existingBorrow) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }

    // Check if user has any overdue books
    const overdueBooks = await Borrow.find({
      user: userId,
      status: 'borrowed',
      dueDate: { $lt: new Date() }
    });

    if (overdueBooks.length > 0) {
      return res.status(400).json({ 
        message: 'You have overdue books. Please return them before borrowing new books.' 
      });
    }

    // Create borrow record
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    const borrow = new Borrow({
      user: userId,
      book: bookId,
      borrowDate,
      dueDate
    });

    await borrow.save();

    // Update book availability
    book.availableCopies -= 1;
    await book.save();

    // Populate the response
    await borrow.populate('user', 'name email studentId');
    await borrow.populate('book', 'title author isbn');

    res.status(201).json({ 
      message: 'Book borrowed successfully', 
      borrow 
    });
  } catch (error) {
    console.error('Borrow book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Return a book
router.put('/:borrowId/return', async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.borrowId);
    
    if (!borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    if (borrow.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned' });
    }

    // Calculate fine if overdue
    let fine = 0;
    if (borrow.isOverdue) {
      const daysOverdue = borrow.daysOverdue;
      fine = daysOverdue * 0.50; // $0.50 per day overdue
    }

    // Update borrow record
    borrow.status = 'returned';
    borrow.returnDate = new Date();
    borrow.fine = fine;
    await borrow.save();

    // Update book availability
    const book = await Book.findById(borrow.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    // Populate the response
    await borrow.populate('user', 'name email studentId');
    await borrow.populate('book', 'title author isbn');

    res.json({ 
      message: 'Book returned successfully', 
      borrow,
      fine: fine > 0 ? `Fine: $${fine.toFixed(2)}` : null
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get overdue books
router.get('/overdue', async (req, res) => {
  try {
    const overdueBorrows = await Borrow.find({
      status: 'borrowed',
      dueDate: { $lt: new Date() }
    })
    .populate('user', 'name email studentId')
    .populate('book', 'title author isbn')
    .sort({ dueDate: 1 });

    res.json(overdueBorrows);
  } catch (error) {
    console.error('Get overdue books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update borrow status (Admin only)
router.put('/:borrowId', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const borrow = await Borrow.findById(req.params.borrowId);
    
    if (!borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    if (status) borrow.status = status;
    if (notes) borrow.notes = notes;

    await borrow.save();

    // Populate the response
    await borrow.populate('user', 'name email studentId');
    await borrow.populate('book', 'title author isbn');

    res.json({ message: 'Borrow record updated successfully', borrow });
  } catch (error) {
    console.error('Update borrow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 