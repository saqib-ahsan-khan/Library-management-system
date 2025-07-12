import React, { useState, useEffect } from 'react';
import './ManageBooks.css';

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    publishedYear: '',
    publisher: '',
    totalCopies: 1,
    location: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
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
      const url = editingBook 
        ? `http://localhost:5000/api/books/${editingBook._id}`
        : 'http://localhost:5000/api/books';
      
      const method = editingBook ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingBook ? 'Book updated successfully!' : 'Book added successfully!');
        setShowAddForm(false);
        setEditingBook(null);
        resetForm();
        fetchBooks();
      } else {
        const error = await response.json();
        alert(error.message || 'Error saving book');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Error saving book');
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      description: book.description || '',
      publishedYear: book.publishedYear || '',
      publisher: book.publisher || '',
      totalCopies: book.totalCopies,
      location: book.location || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/books/${bookId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Book deleted successfully!');
        fetchBooks();
      } else {
        alert('Error deleting book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      description: '',
      publishedYear: '',
      publisher: '',
      totalCopies: 1,
      location: ''
    });
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = !selectedCategory || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(books.map(book => book.category))];

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <div className="manage-books">
      <div className="books-header">
        <h1>Manage Books</h1>
        <button 
          className="add-book-btn"
          onClick={() => {
            setShowAddForm(true);
            setEditingBook(null);
            resetForm();
          }}
        >
          + Add New Book
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <div className="add-book-form">
          <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Published Year</label>
                <input
                  type="number"
                  name="publishedYear"
                  value={formData.publishedYear}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Copies *</label>
                <input
                  type="number"
                  name="totalCopies"
                  value={formData.totalCopies}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingBook ? 'Update Book' : 'Add Book'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingBook(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="books-grid">
        {filteredBooks.map(book => (
          <div key={book._id} className="book-card">
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="author">by {book.author}</p>
              <p className="isbn">ISBN: {book.isbn}</p>
              <p className="category">Category: {book.category}</p>
              <p className="copies">
                Available: {book.availableCopies} / {book.totalCopies}
              </p>
              {book.publisher && <p className="publisher">Publisher: {book.publisher}</p>}
              {book.location && <p className="location">Location: {book.location}</p>}
            </div>
            <div className="book-actions">
              <button 
                className="edit-btn"
                onClick={() => handleEdit(book)}
              >
                Edit
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDelete(book._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="no-books">
          <p>No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default ManageBooks; 