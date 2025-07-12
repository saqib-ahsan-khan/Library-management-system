import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './header.css';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <nav>
        <Link to="/" className="logo">Library Management System</Link>
        <div className="nav-links">
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard">Dashboard</Link>
                  <Link to="/admin/students">Manage Students</Link>
                  <Link to="/admin/books">Manage Books</Link>
                  <Link to="/admin/borrowings">Borrowings</Link>
                </>
              )}
              {user.role === 'student' && (
                <>
                  <Link to="/student/books">Library Books</Link>
                  <Link to="/student/profile">Profile</Link>
                </>
              )}
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/admin-login">Admin Login</Link>
              <Link to="/student-login">Student Login</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header; 