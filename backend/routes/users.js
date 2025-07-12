const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const Borrowing = require('../models/Borrowing');

const router = express.Router();

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user status (Admin only)
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, 
      user: userResponse 
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Borrow a book directly
router.post('/borrow', async (req, res) => {
  try {
    const { userId, bookId, dueDate } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book is available
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available for borrowing' });
    }

    // Check if user already has this book borrowed
    const existingBorrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: 'borrowed'
    });

    if (existingBorrowing) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }

    // Create borrowing record
    const borrowing = new Borrowing({
      user: userId,
      book: bookId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days default
      status: 'borrowed'
    });

    await borrowing.save();

    // Update book availability
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({ 
      message: 'Book borrowed successfully!', 
      borrowing 
    });
  } catch (error) {
    console.error('Borrow book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Return a book
router.post('/return', async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    // Find the borrowing record
    const borrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: 'borrowed'
    });

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    // Update borrowing status
    borrowing.status = 'returned';
    borrowing.returnDate = new Date();

    // Calculate fine if overdue
    if (borrowing.dueDate < new Date()) {
      const daysOverdue = Math.ceil((new Date() - borrowing.dueDate) / (1000 * 60 * 60 * 24));
      borrowing.fine = daysOverdue * 1; // $1 per day
    }

    await borrowing.save();

    // Update book availability
    const book = await Book.findById(bookId);
    book.availableCopies += 1;
    await book.save();

    res.json({ 
      message: 'Book returned successfully', 
      borrowing 
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's borrowing history
router.get('/borrowings/:userId', async (req, res) => {
  try {
    const borrowings = await Borrowing.find({ user: req.params.userId })
      .populate('book', 'title author isbn')
      .sort({ borrowDate: -1 });

    res.json(borrowings);
  } catch (error) {
    console.error('Get borrowings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all borrowings (Admin only)
router.get('/borrowings/all', async (req, res) => {
  try {
    const borrowings = await Borrowing.find({})
      .populate('user', 'name email')
      .populate('book', 'title author isbn')
      .sort({ borrowDate: -1 });

    res.json(borrowings);
  } catch (error) {
    console.error('Get all borrowings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 