const mongoose = require('mongoose');
const User = require('./models/User');
const Book = require('./models/Book');
const Borrowing = require('./models/Borrowing');

// Connect to MongoDB
mongoose.connect('mongodb+srv://saqibahsan:saqibahsan@cluster0.mongodb.net/library_management?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if there are any borrowings
      const borrowings = await Borrowing.find({}).populate('user', 'name email').populate('book', 'title author');
      console.log('Total borrowings:', borrowings.length);
      
      if (borrowings.length > 0) {
        console.log('Sample borrowing:', borrowings[0]);
      } else {
        console.log('No borrowings found in database');
      }
      
      // Check users
      const users = await User.find({});
      console.log('Total users:', users.length);
      
      // Check books
      const books = await Book.find({});
      console.log('Total books:', books.length);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 