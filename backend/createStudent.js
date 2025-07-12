const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs'); // Added missing import for bcrypt

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://saqibahsan220:P1FPgpZu0I7pykTB@cluster0.y6rr2xq.mongodb.net/library_management?retryWrites=true&w=majority';

async function createStudentUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if student user already exists
    const existingStudent = await User.findOne({ email: 'student@library.com' });
    
    if (existingStudent) {
      console.log('Student user already exists. Updating password...');
      // Update the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('student123', salt);
      existingStudent.password = hashedPassword;
      await existingStudent.save();
      console.log('Student password updated successfully');
    } else {
      // Create new student user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('student123', salt);
      
      const studentUser = new User({
        name: 'Test Student',
        email: 'student@library.com',
        password: hashedPassword,
        role: 'student',
        studentId: 'S1001',
        phone: '123-456-7890',
        address: '123 Student St, University City',
        isActive: true
      });

      await studentUser.save();
      console.log('Student user created successfully');
    }

    console.log('Student credentials:');
    console.log('Email: student@library.com');
    console.log('Password: student123');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

createStudentUser(); 