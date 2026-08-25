const express = require('express');

const Orders = require('../models/orders');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.use(isAuthenticated);

const ALLOWED_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

// Load the order and make sure it belongs to the current user
router.param('id', async (req, res, next, id) => {
  try {
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Order id must be a number' });
    }

    const order = await Orders.findById(Number(id));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have access to this order' });
    }

    req.order = order;
    next();
  } catch (err) {
    next(err);
  }
});

// GET /orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await Orders.findAllByUser(req.user.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const items = await Orders.getItems(req.order.id);
    res.json({ ...req.order, items });
  } catch (err) {
    next(err);
  }
});

// PUT /orders/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    if (req.order.status === 'cancelled') {
      return res.status(400).json({ error: 'A cancelled order cannot be updated' });
    }

    if (status === 'cancelled') {
      const cancelled = await Orders.cancel(req.order.id);
      return res.json(cancelled);
    }

    const updated = await Orders.updateStatus(req.order.id, status);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /orders/:id  — cancels the order and restores stock
router.delete('/:id', async (req, res, next) => {
  try {
    if (req.order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    if (['shipped', 'delivered'].includes(req.order.status)) {
      return res.status(400).json({
        error: `An order that has been ${req.order.status} cannot be cancelled`,
      });
    }

    const cancelled = await Orders.cancel(req.order.id);
    res.json({ message: 'Order cancelled', order: cancelled });
  } catch (err) {
    next(err);
  }
});

module.exports = router;