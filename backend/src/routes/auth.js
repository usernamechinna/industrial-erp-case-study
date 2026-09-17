const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { seedUsers } = require('../utils/seed');
const { authorizeRole } = require('../utils/stock');
require('dotenv').config();

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = seedUsers.find(item => item.email.toLowerCase() === String(email || '').toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const validPassword = await bcrypt.compare(String(password || ''), user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '8h'
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  });
});

router.get('/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    return res.json({ user: decoded });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

router.get('/admin-only', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (!authorizeRole(decoded, ['ADMIN'])) {
      return res.status(403).json({ message: 'Forbidden: admin access required' });
    }
    return res.json({ message: 'Admin access granted' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
