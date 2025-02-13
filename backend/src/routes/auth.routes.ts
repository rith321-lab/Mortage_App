import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Mock users for demo
const users = [
  {
    id: 1,
    email: 'test@example.com',
    password: '$2a$10$Ow6C2K.zxKS4Ux1XyDYtOuqmtgQNi0d.yqgZD.qkXNWcZwGk3v3Wy', // "password123"
    name: 'Test User'
  }
];

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name
    };

    users.push(newUser);

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
});

export default router;
