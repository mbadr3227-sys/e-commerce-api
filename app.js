const express = require('express');
const db = require('./db');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'E-Commerce API is running' });
});

// Temporary DB connection test
app.get('/db-test', async (req, res, next) => {
  try {
    const result = await db.query('SELECT COUNT(*) FROM products;');
    res.json({
      message: 'Database connected',
      productCount: Number(result.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;