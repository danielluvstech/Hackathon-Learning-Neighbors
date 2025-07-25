const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const knex = require('knex')(require('./knexfile').development);
const { authenticateToken } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// === AUTH ROUTES ===

// Register
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

// Login
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

// === PROFILE ROUTE ===
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.user.id }).first();

    const userSkills = await knex('skills')
      .where('skills.user_id', req.user.id)
      .select('skills.id', 'skills.skill_name', 'skills.type', 'skills.description');

    res.json({ user, skills: userSkills });
  } catch (err) {
    console.error('❌ Error in /api/profile:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// === SKILLS ROUTES ===
app.post('/api/skills', authenticateToken, async (req, res) => {
  const { skill_name, type, description } = req.body;
  if (!skill_name || !type) {
    return res.status(400).json({ error: 'Invalid skill data' });
  }
  try {
    await knex('skills').insert({
      user_id: req.user.id,
      skill_name,
      type,
      description
    });
    res.status(201).json({ message: 'Skill added!' });
  } catch (err) {
    console.error('Error adding skill:', err);
    res.status(500).json({ error: 'Server error adding skill' });
  }
});

// === SWAP REQUESTS ===

// Create a swap request
app.post('/api/swap-requests', authenticateToken, async (req, res) => {
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

// Fetch all swap requests for logged-in user
app.get('/api/swap-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await knex('swap_requests')
      .join('users as from_user', 'swap_requests.from_user_id', 'from_user.id')
      .join('users as to_user', 'swap_requests.to_user_id', 'to_user.id')
      .join('skills', 'swap_requests.skill_id', 'skills.id')
      .where('to_user_id', req.user.id)
      .orWhere('from_user_id', req.user.id)
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

// ✅ Accept or Reject swap requests
app.patch('/api/swap-requests/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const request = await knex('swap_requests').where({ id }).first();

    if (!request) return res.status(404).json({ error: 'Request not found' });

    // ✅ Only recipient can accept/reject
    if (request.to_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // ✅ Update status
    await knex('swap_requests')
      .where({ id })
      .update({ status });

    // ✅ If accepted: reward both users
    if (status === 'accepted') {
      await knex('users')
        .where('id', request.from_user_id)
        .increment('karma_points', 3);

      await knex('users')
        .where('id', request.to_user_id)
        .increment('karma_points', 3);
    }

    res.json({ message: `Request ${status}` });
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ error: 'Server error updating request' });
  }
});

// ✅ Fetch skills from other users
app.get('/api/other-skills', authenticateToken, async (req, res) => {
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

app.listen(3001, () => console.log('✅ Backend running on port 3001'));
