
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/header/header';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <h1>Library Management System</h1>
      <p>Welcome to the library management system</p>
      <div className="buttons">
        <Link to="/student-login" className="btn">Student Login</Link>
        <Link to="/admin-login" className="btn">Admin Login</Link>
      </div>
    </div>
  );
}

export default App;
