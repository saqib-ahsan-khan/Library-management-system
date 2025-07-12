import React, { useState, useEffect } from 'react';
import './ManageStudents.css';

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      // Filter only students
      const studentUsers = data.filter(user => user.role === 'student');
      setStudents(studentUsers);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
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
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'student'
        })
      });

      if (response.ok) {
        alert('Student registered successfully!');
        setShowAddForm(false);
        resetForm();
        fetchStudents();
      } else {
        const error = await response.json();
        alert(error.message || 'Error registering student');
      }
    } catch (error) {
      console.error('Error registering student:', error);
      alert('Error registering student');
    }
  };

  const handleToggleStatus = async (studentId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${studentId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        alert(currentStatus ? 'Student deactivated!' : 'Student activated!');
        fetchStudents();
      } else {
        alert('Error updating student status');
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      alert('Error updating student status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      studentId: '',
      phone: '',
      address: ''
    });
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.studentId && student.studentId.includes(searchTerm));
    const matchesStatus = !selectedStatus || 
                         (selectedStatus === 'active' && student.isActive) ||
                         (selectedStatus === 'inactive' && !student.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="manage-students">
      <div className="students-header">
        <h1>Manage Students</h1>
        <button 
          className="add-student-btn"
          onClick={() => {
            setShowAddForm(true);
            setEditingStudent(null);
            resetForm();
          }}
        >
          + Add New Student
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="status-filter"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {showAddForm && (
        <div className="add-student-form">
          <h2>Add New Student</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Student ID *</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
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
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                Add Student
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingStudent(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.studentId || 'N/A'}</td>
                <td>{student.phone || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${student.isActive ? 'active' : 'inactive'}`}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="student-actions">
                    <button
                      className={`toggle-btn ${student.isActive ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(student._id, student.isActive)}
                    >
                      {student.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="no-students">
          <p>No students found matching your criteria.</p>
        </div>
      )}

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total Students:</span>
          <span className="stat-value">{students.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Students:</span>
          <span className="stat-value">{students.filter(s => s.isActive).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Inactive Students:</span>
          <span className="stat-value">{students.filter(s => !s.isActive).length}</span>
        </div>
      </div>
    </div>
  );
}

export default ManageStudents; 