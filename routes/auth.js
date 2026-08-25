const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const Users = require('../models/users');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, address } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters long' });
    }

    const existing = await Users.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Users.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      address,
    });

    res.status(201).json({ message: 'Registration successful', user });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Login failed' });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      const { password, ...safeUser } = user;
      res.json({ message: 'Login successful', user: safeUser });
    });
  })(req, res, next);
});

// POST /auth/logout
router.post('/logout', isAuthenticated, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((sessionErr) => {
      if (sessionErr) return next(sessionErr);
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });
});

module.exports = router;