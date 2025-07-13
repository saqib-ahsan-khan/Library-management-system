import React, { useState, useEffect } from 'react';
import './ManageBorrows.css';

function ManageBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [overdueBorrows, setOverdueBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBorrows();
    fetchOverdueBorrows();
  }, []);

  const fetchBorrows = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/borrow');
      const data = await response.json();
      setBorrows(data);
    } catch (error) {
      console.error('Error fetching borrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueBorrows = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/borrow/overdue');
      const data = await response.json();
      setOverdueBorrows(data);
    } catch (error) {
      console.error('Error fetching overdue borrows:', error);
    }
  };

  const handleReturn = async (borrowId) => {
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
        fetchBorrows();
        fetchOverdueBorrows();
      } else {
        setMessage(data.message || 'Failed to return book');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      setMessage('Error returning book. Please try again.');
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
    return <div className="loading">Loading borrow records...</div>;
  }

  const activeBorrows = borrows.filter(borrow => borrow.status === 'borrowed');
  const returnedBorrows = borrows.filter(borrow => borrow.status === 'returned');

  return (
    <div className="manage-borrows">
      <div className="borrows-header">
        <h1>Manage Borrow Records</h1>
        <p>View and manage all book borrowing activities</p>
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Records ({borrows.length})
        </button>
        <button 
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({activeBorrows.length})
        </button>
        <button 
          className={`tab ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue ({overdueBorrows.length})
        </button>
        <button 
          className={`tab ${activeTab === 'returned' ? 'active' : ''}`}
          onClick={() => setActiveTab('returned')}
        >
          Returned ({returnedBorrows.length})
        </button>
      </div>

      <div className="borrows-content">
        {activeTab === 'all' && (
          <div className="borrows-grid">
            {borrows.map(borrow => (
              <div key={borrow._id} className={`borrow-card ${getStatusColor(borrow.status, borrow.dueDate)}`}>
                <div className="book-info">
                  <h3>{borrow.book.title}</h3>
                  <p className="author">by {borrow.book.author}</p>
                  <p className="isbn">ISBN: {borrow.book.isbn}</p>
                  <p className="student">Student: {borrow.user.name} ({borrow.user.studentId || 'N/A'})</p>
                  <p className="email">Email: {borrow.user.email}</p>
                  <p className="borrow-date">Borrowed: {formatDate(borrow.borrowDate)}</p>
                  <p className="due-date">Due: {formatDate(borrow.dueDate)}</p>
                  {borrow.status === 'returned' && (
                    <p className="return-date">Returned: {formatDate(borrow.returnDate)}</p>
                  )}
                  {borrow.fine > 0 && (
                    <p className="fine">Fine: ${borrow.fine.toFixed(2)}</p>
                  )}
                  <p className={`status ${getStatusColor(borrow.status, borrow.dueDate)}`}>
                    {getStatusText(borrow.status, borrow.dueDate)}
                  </p>
                </div>
                {borrow.status === 'borrowed' && (
                  <div className="borrow-actions">
                    <button 
                      className="return-btn"
                      onClick={() => handleReturn(borrow._id)}
                    >
                      Return Book
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="borrows-grid">
            {activeBorrows.map(borrow => (
              <div key={borrow._id} className={`borrow-card ${getStatusColor(borrow.status, borrow.dueDate)}`}>
                <div className="book-info">
                  <h3>{borrow.book.title}</h3>
                  <p className="author">by {borrow.book.author}</p>
                  <p className="isbn">ISBN: {borrow.book.isbn}</p>
                  <p className="student">Student: {borrow.user.name} ({borrow.user.studentId || 'N/A'})</p>
                  <p className="email">Email: {borrow.user.email}</p>
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
                  >
                    Return Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'overdue' && (
          <div className="borrows-grid">
            {overdueBorrows.map(borrow => (
              <div key={borrow._id} className="borrow-card overdue">
                <div className="book-info">
                  <h3>{borrow.book.title}</h3>
                  <p className="author">by {borrow.book.author}</p>
                  <p className="isbn">ISBN: {borrow.book.isbn}</p>
                  <p className="student">Student: {borrow.user.name} ({borrow.user.studentId || 'N/A'})</p>
                  <p className="email">Email: {borrow.user.email}</p>
                  <p className="borrow-date">Borrowed: {formatDate(borrow.borrowDate)}</p>
                  <p className="due-date">Due: {formatDate(borrow.dueDate)}</p>
                  <p className="status overdue">
                    {getStatusText(borrow.status, borrow.dueDate)}
                  </p>
                </div>
                <div className="borrow-actions">
                  <button 
                    className="return-btn"
                    onClick={() => handleReturn(borrow._id)}
                  >
                    Return Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'returned' && (
          <div className="borrows-grid">
            {returnedBorrows.map(borrow => (
              <div key={borrow._id} className="borrow-card returned">
                <div className="book-info">
                  <h3>{borrow.book.title}</h3>
                  <p className="author">by {borrow.book.author}</p>
                  <p className="isbn">ISBN: {borrow.book.isbn}</p>
                  <p className="student">Student: {borrow.user.name} ({borrow.user.studentId || 'N/A'})</p>
                  <p className="email">Email: {borrow.user.email}</p>
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

        {((activeTab === 'all' && borrows.length === 0) ||
          (activeTab === 'active' && activeBorrows.length === 0) ||
          (activeTab === 'overdue' && overdueBorrows.length === 0) ||
          (activeTab === 'returned' && returnedBorrows.length === 0)) && (
          <div className="no-borrows">
            <p>No borrow records found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageBorrows; 