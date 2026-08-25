const express = require('express');

const Products = require('../models/products');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Load product on :id routes
router.param('id', async (req, res, next, id) => {
  try {
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Product id must be a number' });
    }

    const product = await Products.findById(Number(id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    req.product = product;
    next();
  } catch (err) {
    next(err);
  }
});

// GET /products
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const products = await Products.findAll({ category, search });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /products/:id
router.get('/:id', (req, res) => {
  res.json(req.product);
});

// POST /products
router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }

    const product = await Products.create({
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /products/:id
router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }

    const product = await Products.update(req.product.id, {
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
    });

    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /products/:id
router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    await Products.remove(req.product.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;