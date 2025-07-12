import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeBorrowings: 0,
    overdueBooks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [booksRes, usersRes, borrowingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/books'),
        fetch('http://localhost:5000/api/users'),
        fetch('http://localhost:5000/api/users/borrowings/all')
      ]);

      const books = await booksRes.json();
      const users = await usersRes.json();
      const borrowings = borrowingsRes.ok ? await borrowingsRes.json() : [];

      const activeBorrowings = borrowings.filter(b => b.status === 'borrowed').length;
      const overdueBooks = borrowings.filter(b => 
        b.status === 'borrowed' && new Date(b.dueDate) < new Date()
      ).length;

      setStats({
        totalBooks: books.length,
        totalUsers: users.length,
        activeBorrowings,
        overdueBooks
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.totalBooks}</h3>
            <p>Total Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Registered Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>{stats.activeBorrowings}</h3>
            <p>Active Borrowings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.overdueBooks}</h3>
            <p>Overdue Books</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => window.location.href = '/admin/books'}>
            Manage Books
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/admin/students'}>
            Manage Students
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/admin/borrowings'}>
            View Borrowings
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 