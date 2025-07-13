# Library Management System

A full-stack library management system built with React frontend and Node.js/Express backend with MongoDB database.

## Features

- User authentication (Student and Admin roles)
- Book management (Add, Edit, Delete, Search)
- User profile management
- Book catalog browsing

## Tech Stack

### Frontend
- React.js
- React Router DOM
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd library-management-system
```

2. Install dependencies
```bash
npm install
```

3. Set up MongoDB
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `library_management`

4. Configure environment variables
   - Copy `backend/config.env` and update the values:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure secret key for JWT tokens
     - `PORT`: Backend server port (default: 5000)

5. Start the development servers

   **Option 1: Run both frontend and backend together**
   ```bash
   npm run dev
   ```

   **Option 2: Run separately**
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm start
   ```

6. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Books
- `GET /api/books` - Get all books (with search/filter)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Add new book (Admin)
- `PUT /api/books/:id` - Update book (Admin)
- `DELETE /api/books/:id` - Delete book (Admin)

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update user profile
- `GET /api/users` - Get all users (Admin)

## Database Models

### User
- name, email, password, role (student/admin)
- studentId, phone, address
- isActive status

### Book
- title, author, isbn, category
- description, publishedYear, publisher
- totalCopies, availableCopies, location
- isActive status



## Usage

1. **Registration/Login**: Users can register as students or admins
2. **Book Management**: Admins can add, edit, and delete books
3. **Book Search**: Users can search books by title, author, or ISBN
4. **Book Catalog**: Students can browse and view book details
5. **User Management**: Admins can manage student accounts
6. **Profile Management**: Users can update their profile information

## Development

The project uses a monorepo structure:
- `/src` - React frontend
- `/backend` - Node.js/Express backend
- `/backend/models` - MongoDB schemas
- `/backend/routes` - API route handlers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 
