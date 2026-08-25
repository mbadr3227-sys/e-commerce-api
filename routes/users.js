const express = require('express');

const Users = require('../models/users');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(isAuthenticated);

// GET /users/me
router.get('/me', async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /users/me
router.put('/me', async (req, res, next) => {
  try {
    const { firstName, lastName, address } = req.body;

    if (
      firstName === undefined &&
      lastName === undefined &&
      address === undefined
    ) {
      return res.status(400).json({
        error: 'Provide at least one of: firstName, lastName, address',
      });
    }

    const user = await Users.update(req.user.id, { firstName, lastName, address });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /users/me
router.delete('/me', async (req, res, next) => {
  try {
    await Users.remove(req.user.id);

    req.logout((err) => {
      if (err) return next(err);

      req.session.destroy((sessionErr) => {
        if (sessionErr) return next(sessionErr);
        res.clearCookie('connect.sid');
        res.status(204).send();
      });
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;