const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('./knexfile').development);
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// === Auth Middleware ===
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

// === User Registration ===
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

// === User Login ===
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
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// === Get Profile + User Skills ===
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.user.id }).first();
    const skills = await knex('skills').where({ user_id: req.user.id });
    res.json({ user: { id: user.id, username: user.username, email: user.email }, skills });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// === Add Skill ===
app.post('/api/skills', authenticate, async (req, res) => {
  const { skill_name, type, description } = req.body;
  if (!skill_name || !type || !['offered', 'requested'].includes(type)) {
    return res.status(400).json({ error: 'Invalid skill data' });
  }

  try {
    await knex('skills').insert({
      user_id: req.user.id,
      skill_name,
      type,
      description
    });
    res.status(201).json({ message: 'Skill added' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// === Get Skills from Other Users ===
app.get('/api/other-skills', authenticate, async (req, res) => {
  try {
    const otherSkills = await knex('skills')
      .join('users', 'skills.user_id', '=', 'users.id')
      .select(
        'skills.id',
        'skills.skill_name',
        'skills.type',
        'skills.description',
        'users.username',
        'users.id as user_id'
      )
      .whereNot('skills.user_id', req.user.id);

    res.json({ otherSkills });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching other users’ skills' });
  }
});

// === Create Swap Request ===
app.post('/api/swap-requests', authenticate, async (req, res) => {
  const { to_user_id, skill_id, message } = req.body;

  if (!to_user_id || !skill_id || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await knex('swap_requests').insert({
      from_user_id: req.user.id,
      to_user_id,
      skill_id,
      message,
      status: 'pending'
    });

    res.status(201).json({ message: 'Swap request sent!' });
  } catch (err) {
    console.error('🔴 Error inserting swap request:', err);
    res.status(500).json({ error: 'Server error creating swap request' });
  }
});

// === Get All Swap Requests (Sent + Received) ===
app.get('/api/swap-requests', authenticate, async (req, res) => {
  try {
    const requests = await knex('swap_requests')
      .where('to_user_id', req.user.id)
      .orWhere('from_user_id', req.user.id)
      .join('users as from_user', 'swap_requests.from_user_id', 'from_user.id')
      .join('users as to_user', 'swap_requests.to_user_id', 'to_user.id')
      .join('skills', 'swap_requests.skill_id', 'skills.id')
      .select(
        'swap_requests.*',
        'from_user.username as from_username',
        'to_user.username as to_username',
        'skills.skill_name'
      );

    res.json({ requests });
  } catch (err) {
    console.error('Error fetching swap requests:', err);
    res.status(500).json({ error: 'Server error fetching swap requests' });
  }
});

// === Update Swap Request Status ===
app.patch('/api/swap-requests/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updated = await knex('swap_requests')
      .where({ id, to_user_id: req.user.id })
      .update({ status });

    if (updated === 0) {
      return res.status(403).json({ error: 'Unauthorized or invalid request ID' });
    }

    res.json({ message: `Request ${status}` });
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ error: 'Server error updating request' });
  }
});

// Submit a review for a completed swap
app.post('/api/reviews', authenticate, async (req, res) => {
  const { to_user_id, swap_request_id, rating, comment } = req.body;

  if (!to_user_id || !swap_request_id || !rating) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const swap = await knex('swap_requests')
      .where({ id: swap_request_id, from_user_id: req.user.id })
      .orWhere({ id: swap_request_id, to_user_id: req.user.id })
      .andWhere({ status: 'accepted' })
      .first();

    if (!swap) {
      return res.status(403).json({ error: 'You can only review completed swaps' });
    }

    await knex('reviews').insert({
      from_user_id: req.user.id,
      to_user_id,
      swap_request_id,
      rating,
      comment
    });

    // Increment karma points of the reviewed user
    await knex('users')
      .where({ id: to_user_id })
      .increment('karma_points', rating);

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Server error submitting review' });
  }
});

// Get reviews submitted by this user
app.get('/api/reviews/from-user/:id', authenticate, async (req, res) => {
  try {
    const reviews = await knex('reviews').where({ from_user_id: req.params.id });
    res.json({ reviews });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3001, () => console.log('✅ Backend running on port 3001'));
