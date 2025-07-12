
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Header from './components/header/Header';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageBooks from './pages/ManageBooks';
import ManageStudents from './pages/ManageStudents';

// Placeholder components for remaining pages
const BorrowRequests = () => <div style={{ padding: 20 }}><h2>Borrow Requests (Admin)</h2></div>;
const StudentProfile = () => <div style={{ padding: 20 }}><h2>Student Profile</h2></div>;
const StudentBooks = () => <div style={{ padding: 20 }}><h2>Library Books (Student)</h2></div>;

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Home Component
const Home = () => {
  const { user } = useContext(AuthContext);
  
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/student/books" replace />;
    }
  }
  
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to the Library Management System</h1>
        <p>Please login to access your account</p>
        <div className="login-options">
          <a href="/admin-login" className="login-btn admin">Admin Login</a>
          <a href="/student-login" className="login-btn student">Student Login</a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/books" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageBooks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/students" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageStudents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/requests" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BorrowRequests />
              </ProtectedRoute>
            } 
          />
          
          {/* Student Routes */}
          <Route 
            path="/student/profile" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/books" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentBooks />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
