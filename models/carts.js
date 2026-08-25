const db = require('../db');

// Get the user's cart, creating one if it doesn't exist yet
const findOrCreateByUserId = async (userId) => {
  const existing = await db.query('SELECT * FROM carts WHERE user_id = $1;', [userId]);
  if (existing.rows[0]) return existing.rows[0];

  const created = await db.query(
    'INSERT INTO carts (user_id) VALUES ($1) RETURNING *;',
    [userId]
  );
  return created.rows[0];
};

// Get cart items joined with product details
const getItems = async (cartId) => {
  const result = await db.query(
    `SELECT ci.product_id,
            ci.quantity,
            p.name,
            p.price,
            p.stock,
            p.category,
            p.image_url,
            (ci.quantity * p.price) AS line_total
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.product_id;`,
    [cartId]
  );
  return result.rows;
};

// Add a product, or increase quantity if already in the cart
const addItem = async (cartId, productId, quantity) => {
  const result = await db.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity,
                   updated_at = NOW()
     RETURNING *;`,
    [cartId, productId, quantity]
  );
  return result.rows[0];
};

const updateItem = async (cartId, productId, quantity) => {
  const result = await db.query(
    `UPDATE cart_items
     SET quantity = $3, updated_at = NOW()
     WHERE cart_id = $1 AND product_id = $2
     RETURNING *;`,
    [cartId, productId, quantity]
  );
  return result.rows[0];
};

const removeItem = async (cartId, productId) => {
  const result = await db.query(
    'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *;',
    [cartId, productId]
  );
  return result.rows[0];
};

const clear = async (cartId) => {
  await db.query('DELETE FROM cart_items WHERE cart_id = $1;', [cartId]);
};

module.exports = {
  findOrCreateByUserId,
  getItems,
  addItem,
  updateItem,
  removeItem,
  clear,
};