const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const knex = require('knex')(require('./knexfile').development);
const skillsRoutes = require('./routes/skills'); // ✅ New route

const app = express();
app.use(cors());
app.use(express.json());

// Register route
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await knex('users').insert({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await knex('users').where({ email }).first();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Profile route with user_skills + skills join
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.user.id }).first();

    const skills = await knex('user_skills')
      .join('skills', 'user_skills.skill_id', 'skills.id')
      .where('user_skills.user_id', req.user.id)
      .select('skills.name', 'user_skills.type');

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      skills,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Mount /api/skills route for POST /add
app.use('/api/skills', skillsRoutes);

app.listen(3001, () => console.log('Backend running on port 3001'));
