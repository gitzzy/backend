// app.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config(); // Load environment variables from .env

const app = express();
const port = process.env.PORT || 1234;
const mongoURL = process.env.MONGO_URL;

// ----------------------------
// MongoDB Connection
// ----------------------------
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// ----------------------------
// CORS Setup
// ----------------------------
app.use(cors({
  origin: ['http://localhost:5173'], // Allow your frontend origin
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// ----------------------------
// Middleware
// ----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ----------------------------
// Test Route
// ----------------------------
app.get('/', (req, res) => {
  res.send('<h1>Backend Running</h1>');
});

// ----------------------------
// Mongoose Schema & Model
// ----------------------------
const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ----------------------------
// Routes
// ----------------------------

// Create new user
app.post('/api/user', async (req, res) => {
  try {
    const { fname, lname, uname, mail, pass } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(pass, 10);

    const newUser = new User({
      firstName: fname,
      lastName: lname,
      userName: uname,
      email: mail,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User created', user: newUser });

  } catch (err) {
    // Duplicate key error (username or email already exists)
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

// ----------------------------
// Start Server
// ----------------------------
app.listen(port, () => console.log(`Server running on port ${port}`));

