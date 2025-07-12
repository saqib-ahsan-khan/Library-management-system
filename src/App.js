
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/header/Header';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
// Placeholder components for new pages
const Home = () => <div style={{ padding: 20 }}><h2>Welcome to the Library Management System</h2></div>;
const ManageStudents = () => <div style={{ padding: 20 }}><h2>Manage Students (Admin)</h2></div>;
const ManageBooks = () => <div style={{ padding: 20 }}><h2>Manage Books (Admin)</h2></div>;
const BorrowRequests = () => <div style={{ padding: 20 }}><h2>Borrow Requests (Admin)</h2></div>;
const StudentProfile = () => <div style={{ padding: 20 }}><h2>Student Profile</h2></div>;
const StudentBooks = () => <div style={{ padding: 20 }}><h2>Library Books (Student)</h2></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/books" element={<ManageBooks />} />
          <Route path="/admin/requests" element={<BorrowRequests />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/books" element={<StudentBooks />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
