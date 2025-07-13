import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './MyBorrows.css';

function MyBorrows() {
  const { user } = useContext(AuthContext);
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchBorrows();
    }
  }, [user]);

  const fetchBorrows = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/borrow/user/${user._id}`);
      const data = await response.json();
      setBorrows(data);
    } catch (error) {
      console.error('Error fetching borrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId) => {
    setReturning(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/borrow/${borrowId}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Book returned successfully!' + (data.fine ? ` ${data.fine}` : ''));
        fetchBorrows(); // Refresh the list
      } else {
        setMessage(data.message || 'Failed to return book');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      setMessage('Error returning book. Please try again.');
    } finally {
      setReturning(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status, dueDate) => {
    if (status === 'returned') return 'returned';
    if (status === 'borrowed') {
      const due = new Date(dueDate);
      const now = new Date();
      return now > due ? 'overdue' : 'active';
    }
    return 'default';
  };

  const getStatusText = (status, dueDate) => {
    if (status === 'returned') return 'Returned';
    if (status === 'borrowed') {
      const due = new Date(dueDate);
      const now = new Date();
      if (now > due) {
        const daysOverdue = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
        return `Overdue (${daysOverdue} days)`;
      }
      return 'Borrowed';
    }
    return status;
  };

  if (loading) {
    return <div className="loading">Loading your borrows...</div>;
  }

  const activeBorrows = borrows.filter(borrow => borrow.status === 'borrowed');
  const returnedBorrows = borrows.filter(borrow => borrow.status === 'returned');

  return (
    <div className="my-borrows">
      <div className="borrows-header">
        <h1>My Borrowed Books</h1>
        <p>Welcome, {user?.name}! Manage your borrowed books here.</p>
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="borrows-content">
        <div className="active-borrows">
          <h2>Currently Borrowed ({activeBorrows.length})</h2>
          {activeBorrows.length === 0 ? (
            <p className="no-borrows">You haven't borrowed any books yet.</p>
          ) : (
            <div className="borrows-grid">
              {activeBorrows.map(borrow => (
                <div key={borrow._id} className={`borrow-card ${getStatusColor(borrow.status, borrow.dueDate)}`}>
                  <div className="book-info">
                    <h3>{borrow.book.title}</h3>
                    <p className="author">by {borrow.book.author}</p>
                    <p className="isbn">ISBN: {borrow.book.isbn}</p>
                    <p className="category">Category: {borrow.book.category}</p>
                    <p className="borrow-date">Borrowed: {formatDate(borrow.borrowDate)}</p>
                    <p className="due-date">Due: {formatDate(borrow.dueDate)}</p>
                    <p className={`status ${getStatusColor(borrow.status, borrow.dueDate)}`}>
                      {getStatusText(borrow.status, borrow.dueDate)}
                    </p>
                  </div>
                  <div className="borrow-actions">
                    <button 
                      className="return-btn"
                      onClick={() => handleReturn(borrow._id)}
                      disabled={returning}
                    >
                      {returning ? 'Returning...' : 'Return Book'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="returned-borrows">
          <h2>Returned Books ({returnedBorrows.length})</h2>
          {returnedBorrows.length > 0 && (
            <div className="borrows-grid">
              {returnedBorrows.map(borrow => (
                <div key={borrow._id} className="borrow-card returned">
                  <div className="book-info">
                    <h3>{borrow.book.title}</h3>
                    <p className="author">by {borrow.book.author}</p>
                    <p className="isbn">ISBN: {borrow.book.isbn}</p>
                    <p className="category">Category: {borrow.book.category}</p>
                    <p className="borrow-date">Borrowed: {formatDate(borrow.borrowDate)}</p>
                    <p className="return-date">Returned: {formatDate(borrow.returnDate)}</p>
                    {borrow.fine > 0 && (
                      <p className="fine">Fine: ${borrow.fine.toFixed(2)}</p>
                    )}
                    <p className="status returned">Returned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyBorrows; 