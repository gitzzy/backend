// app.js or index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 1234;
const mongoURL = process.env.MONGO_URL;

// Connect to MongoDB
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors()); // For all origins
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test route
app.get('/', (req, res) => {
  res.send('<h1>Backend Running</h1>');
});

// Mongoose Schema & Model
const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Routes

// Create user
app.post('/api/user', async (req, res) => {
  try {
    const { fname, lname, uname, mail, pass } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(pass, 10);

    const newUser = new User({
      firstName: fname,
      lastName: lname,
      userName: uname,
      email: mail,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    // Duplicate key error (unique fields)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists', error: err.message });
    }
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

// Get all users
app.get('/api/user', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
