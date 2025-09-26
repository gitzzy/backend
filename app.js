// app.js or index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 1234;
const mongoURL = process.env.MONGO_URL; // MongoDB Atlas connection

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Schema and Model
const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/user', async (req, res) => {
  try {
    const body = req.body;
    const newUser = new User({
      firstName: body.fname,
      lastName: body.lname,
      userName: body.uname,
      email: body.mail,
      password: body.pass
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

app.get('/api/user', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
