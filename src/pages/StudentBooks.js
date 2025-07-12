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
  const [borrowingHistory, setBorrowingHistory] = useState([]);

  useEffect(() => {
    fetchBooks();
    fetchBorrowingHistory();
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

  const fetchBorrowingHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/borrowings/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBorrowingHistory(data);
      }
    } catch (error) {
      console.error('Error fetching borrowing history:', error);
    }
  };

  const handleBorrow = async (bookId) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          bookId: bookId,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        })
      });

      if (response.ok) {
        alert('Book borrowed successfully!');
        fetchBooks();
        fetchBorrowingHistory();
      } else {
        const error = await response.json();
        alert(error.message || 'Error borrowing book');
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert('Error borrowing book');
    }
  };

  const handleReturn = async (bookId) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          bookId: bookId
        })
      });

      if (response.ok) {
        alert('Book returned successfully!');
        fetchBooks();
        fetchBorrowingHistory();
      } else {
        const error = await response.json();
        alert(error.message || 'Error returning book');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Error returning book');
    }
  };

  const getBookStatus = (bookId) => {
    const borrowing = borrowingHistory.find(b => b.book._id === bookId);
    if (!borrowing) return 'none';
    return borrowing.status;
  };

  const getBorrowingRecord = (bookId) => {
    return borrowingHistory.find(b => b.book._id === bookId);
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
        {filteredBooks.map(book => {
          const bookStatus = getBookStatus(book._id);
          const borrowingRecord = getBorrowingRecord(book._id);
          
          return (
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
                
                {bookStatus === 'borrowed' && borrowingRecord && (
                  <div className="borrowed-info">
                    <p className="borrowed-date">
                      Borrowed: {new Date(borrowingRecord.borrowDate).toLocaleDateString()}
                    </p>
                    <p className="due-date">
                      Due: {new Date(borrowingRecord.dueDate).toLocaleDateString()}
                    </p>
                    {new Date(borrowingRecord.dueDate) < new Date() && (
                      <p className="overdue">⚠️ OVERDUE</p>
                    )}
                  </div>
                )}
              </div>
              <div className="book-actions">
                {bookStatus === 'none' && (
                  <button 
                    className="borrow-btn"
                    onClick={() => handleBorrow(book._id)}
                    disabled={book.availableCopies <= 0}
                  >
                    {book.availableCopies > 0 ? 'Borrow Book' : 'Not Available'}
                  </button>
                )}
                {bookStatus === 'borrowed' && (
                  <button 
                    className="return-btn"
                    onClick={() => handleReturn(book._id)}
                  >
                    Return Book
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="no-books">
          <p>No books found matching your criteria.</p>
        </div>
      )}

      <div className="borrowing-summary">
        <h2>Your Borrowing Summary</h2>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Currently Borrowed:</span>
            <span className="stat-value">
              {borrowingHistory.filter(b => b.status === 'borrowed').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Overdue Books:</span>
            <span className="stat-value overdue-count">
              {borrowingHistory.filter(b => 
                b.status === 'borrowed' && new Date(b.dueDate) < new Date()
              ).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Borrowed:</span>
            <span className="stat-value">
              {borrowingHistory.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentBooks; 