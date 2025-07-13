import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './StudentBooks.css';

function StudentBooks() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [borrowingBookId, setBorrowingBookId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    console.log('Current user in StudentBooks:', user); // Debug log
    if (!user) {
      setMessage('Please log in to borrow books');
      return;
    }

    setBorrowingBookId(bookId);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id, // Use id instead of _id
          bookId: bookId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Book borrowed successfully! Due date: ' + new Date(data.borrow.dueDate).toLocaleDateString());
        fetchBooks();
      } else {
        setMessage(data.message || 'Failed to borrow book');
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      setMessage('Error borrowing book. Please try again.');
    } finally {
      setBorrowingBookId(null);
    }
  };



  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = !selectedCategory || book.category === selectedCategory;
    const matchesAvailability = !showAvailableOnly || book.availableCopies > 0;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const categories = [...new Set(books.map(book => book.category))];

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <div className="student-books">
      <div className="books-header">
        <h1>Library Books</h1>
        <p>Welcome, {user?.name}! Browse and borrow books from our collection.</p>
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search books by title, author, or ISBN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
          />
          Show available books only
        </label>
      </div>

      <div className="books-grid">
        {filteredBooks.map(book => (
          <div key={book._id} className="book-card">
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="author">by {book.author}</p>
              <p className="isbn">ISBN: {book.isbn}</p>
              <p className="category">Category: {book.category}</p>
              <p className="copies">
                Available: {book.availableCopies} / {book.totalCopies}
              </p>
              {book.publisher && <p className="publisher">Publisher: {book.publisher}</p>}
              {book.location && <p className="location">Location: {book.location}</p>}
            </div>
            <div className="book-actions">
              <button 
                className="borrow-btn"
                disabled={book.availableCopies <= 0 || borrowingBookId === book._id}
                onClick={() => handleBorrow(book._id)}
              >
                {borrowingBookId === book._id
                  ? 'Borrowing...'
                  : book.availableCopies > 0
                    ? 'Borrow Book'
                    : 'Not Available'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="no-books">
          <p>No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default StudentBooks; 