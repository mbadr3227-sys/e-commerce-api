const express = require('express');

const Carts = require('../models/carts');
const Products = require('../models/products');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.use(isAuthenticated);

// Attach the current user's cart to every request
router.use(async (req, res, next) => {
  try {
    req.cart = await Carts.findOrCreateByUserId(req.user.id);
    next();
  } catch (err) {
    next(err);
  }
});

const buildCartResponse = (cart, items) => {
  const total = items.reduce((sum, item) => sum + Number(item.line_total), 0);
  return {
    cartId: cart.id,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: Number(total.toFixed(2)),
  };
};

// GET /cart
router.get('/', async (req, res, next) => {
  try {
    const items = await Carts.getItems(req.cart.id);
    res.json(buildCartResponse(req.cart, items));
  } catch (err) {
    next(err);
  }
});

// POST /cart/items
router.post('/items', async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }

    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ error: `Only ${product.stock} left in stock` });
    }

    await Carts.addItem(req.cart.id, productId, qty);

    const items = await Carts.getItems(req.cart.id);
    res.status(201).json(buildCartResponse(req.cart, items));
  } catch (err) {
    next(err);
  }
});

// PUT /cart/items/:productId
router.put('/items/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }

    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ error: `Only ${product.stock} left in stock` });
    }

    const updated = await Carts.updateItem(req.cart.id, productId, qty);
    if (!updated) {
      return res.status(404).json({ error: 'Item not in cart' });
    }

    const items = await Carts.getItems(req.cart.id);
    res.json(buildCartResponse(req.cart, items));
  } catch (err) {
    next(err);
  }
});

// DELETE /cart/items/:productId
router.delete('/items/:productId', async (req, res, next) => {
  try {
    const removed = await Carts.removeItem(req.cart.id, req.params.productId);
    if (!removed) {
      return res.status(404).json({ error: 'Item not in cart' });
    }

    const items = await Carts.getItems(req.cart.id);
    res.json(buildCartResponse(req.cart, items));
  } catch (err) {
    next(err);
  }
});

// DELETE /cart
router.delete('/', async (req, res, next) => {
  try {
    await Carts.clear(req.cart.id);
    res.json(buildCartResponse(req.cart, []));
  } catch (err) {
    next(err);
  }
});
// POST /cart/checkout
router.post('/checkout', async (req, res, next) => {
  try {
    const Orders = require('../models/orders');

    const { shippingAddress } = req.body;
    const address = shippingAddress || req.user.address;

    if (!address) {
      return res.status(400).json({
        error: 'A shipping address is required. Provide one or set it on your profile.',
      });
    }

    const { order, error } = await Orders.createFromCart(
      req.user.id,
      req.cart.id,
      address
    );

    if (error) {
      return res.status(400).json({ error });
    }

    const items = await Orders.getItems(order.id);
    res.status(201).json({ message: 'Order placed successfully', order, items });
  } catch (err) {
    next(err);
  }
});
module.exports = router;