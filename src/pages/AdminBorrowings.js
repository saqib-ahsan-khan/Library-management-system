import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AdminBorrowings.css';

function AdminBorrowings() {
  const { user } = useContext(AuthContext);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, borrowed, returned, overdue

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/borrowings/all');
      if (response.ok) {
        const data = await response.json();
        setBorrowings(data);
      }
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, dueDate) => {
    const isOverdue = status === 'borrowed' && new Date(dueDate) < new Date();
    
    const statusConfig = {
      borrowed: { text: isOverdue ? 'Overdue' : 'Borrowed', className: isOverdue ? 'status-overdue' : 'status-borrowed' },
      returned: { text: 'Returned', className: 'status-returned' }
    };

    const config = statusConfig[status] || { text: status, className: 'status-default' };
    return <span className={`status-badge ${config.className}`}>{config.text}</span>;
  };

  const filteredBorrowings = borrowings.filter(borrowing => {
    if (filter === 'all') return true;
    if (filter === 'overdue') {
      return borrowing.status === 'borrowed' && new Date(borrowing.dueDate) < new Date();
    }
    return borrowing.status === filter;
  });

  if (loading) {
    return <div className="loading">Loading borrowings...</div>;
  }

  return (
    <div className="admin-borrowings">
      <div className="borrowings-header">
        <h1>Borrowings Management</h1>
        <p>View and manage all book borrowings in the system</p>
      </div>

      <div className="filters">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Borrowings</option>
          <option value="borrowed">Currently Borrowed</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="borrowings-list">
        {filteredBorrowings.length === 0 ? (
          <div className="no-borrowings">
            <p>No borrowings found matching the selected filter.</p>
          </div>
        ) : (
          filteredBorrowings.map(borrowing => (
            <div key={borrowing._id} className="borrowing-card">
              <div className="borrowing-info">
                <div className="user-info">
                  <h3>{borrowing.user?.name || 'Unknown User'}</h3>
                  <p className="user-email">{borrowing.user?.email}</p>
                </div>
                
                <div className="book-info">
                  <h4>{borrowing.book?.title}</h4>
                  <p className="book-author">by {borrowing.book?.author}</p>
                  <p className="book-isbn">ISBN: {borrowing.book?.isbn}</p>
                </div>

                <div className="borrowing-details">
                  <div className="borrow-date">
                    <strong>Borrowed:</strong> {new Date(borrowing.borrowDate).toLocaleDateString()}
                  </div>
                  <div className="due-date">
                    <strong>Due:</strong> {new Date(borrowing.dueDate).toLocaleDateString()}
                  </div>
                  {borrowing.returnDate && (
                    <div className="return-date">
                      <strong>Returned:</strong> {new Date(borrowing.returnDate).toLocaleDateString()}
                    </div>
                  )}
                  {borrowing.fine > 0 && (
                    <div className="fine-amount">
                      <strong>Fine:</strong> ${borrowing.fine}
                    </div>
                  )}
                </div>

                <div className="borrowing-status">
                  {getStatusBadge(borrowing.status, borrowing.dueDate)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="borrowings-summary">
        <h2>Summary</h2>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Borrowings:</span>
            <span className="stat-value">{borrowings.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Currently Borrowed:</span>
            <span className="stat-value borrowed-count">
              {borrowings.filter(b => b.status === 'borrowed').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Returned:</span>
            <span className="stat-value returned-count">
              {borrowings.filter(b => b.status === 'returned').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Overdue:</span>
            <span className="stat-value overdue-count">
              {borrowings.filter(b => 
                b.status === 'borrowed' && new Date(b.dueDate) < new Date()
              ).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminBorrowings; 