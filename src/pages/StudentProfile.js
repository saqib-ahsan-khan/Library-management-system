import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './StudentProfile.css';

function StudentProfile() {
  const { user, login } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchBorrowingHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/profile/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/users/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile.user);
        setEditing(false);
        alert('Profile updated successfully!');
        
        // Update the user context with new profile data
        login(updatedProfile.user, user.token);
      } else {
        const error = await response.json();
        alert(error.message || 'Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const calculateFine = (borrowing) => {
    if (borrowing.status === 'borrowed' && new Date(borrowing.dueDate) < new Date()) {
      const daysOverdue = Math.ceil((new Date() - new Date(borrowing.dueDate)) / (1000 * 60 * 60 * 24));
      return daysOverdue * 1; // $1 per day
    }
    return 0;
  };

  const totalFine = borrowingHistory.reduce((total, borrowing) => {
    return total + calculateFine(borrowing);
  }, 0);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="student-profile">
      <div className="profile-header">
        <h1>Student Profile</h1>
        <p>Manage your account information and view your borrowing history</p>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            <button 
              className="edit-btn"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile?.email}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Student ID</label>
                <input
                  type="text"
                  value={profile?.studentId}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{profile?.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{profile?.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Student ID:</span>
                <span className="value">{profile?.studentId}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone:</span>
                <span className="value">{profile?.phone || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <span className="label">Address:</span>
                <span className="value">{profile?.address || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>Borrowing Summary</h2>
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>{borrowingHistory.filter(b => b.status === 'borrowed').length}</h3>
                <p>Currently Borrowed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>{borrowingHistory.filter(b => 
                  b.status === 'borrowed' && new Date(b.dueDate) < new Date()
                ).length}</h3>
                <p>Overdue Books</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>${totalFine.toFixed(2)}</h3>
                <p>Total Fines</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📖</div>
              <div className="stat-content">
                <h3>{borrowingHistory.length}</h3>
                <p>Total Borrowed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Borrowing History</h2>
          <div className="borrowing-table">
            <table>
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody>
                {borrowingHistory.map(borrowing => {
                  const fine = calculateFine(borrowing);
                  const isOverdue = borrowing.status === 'borrowed' && new Date(borrowing.dueDate) < new Date();
                  
                  return (
                    <tr key={borrowing._id} className={isOverdue ? 'overdue-row' : ''}>
                      <td>{borrowing.book.title}</td>
                      <td>{borrowing.book.author}</td>
                      <td>{new Date(borrowing.borrowDate).toLocaleDateString()}</td>
                      <td>{new Date(borrowing.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${borrowing.status}`}>
                          {borrowing.status === 'borrowed' ? 'Borrowed' : 'Returned'}
                        </span>
                      </td>
                      <td>
                        {fine > 0 ? `$${fine.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {borrowingHistory.length === 0 && (
            <div className="no-history">
              <p>No borrowing history found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentProfile; 