const db = require('../db');

// Create an order from the user's cart inside a single transaction
const createFromCart = async (userId, cartId, shippingAddress) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Lock the cart items and their products
    const itemsResult = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1
       FOR UPDATE OF p;`,
      [cartId]
    );

    const items = itemsResult.rows;

    if (items.length === 0) {
      await client.query('ROLLBACK');
      return { error: 'Cart is empty' };
    }

    // Verify stock before committing to anything
    for (const item of items) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return {
          error: `Not enough stock for "${item.name}". Available: ${item.stock}`,
        };
      }
    }

    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, status, shipping_address)
       VALUES ($1, $2, 'pending', $3)
       RETURNING *;`,
      [userId, total.toFixed(2), shippingAddress || null]
    );

    const order = orderResult.rows[0];

    // Copy cart items into order items, freezing the price
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4);`,
        [order.id, item.product_id, item.quantity, item.price]
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $2, updated_at = NOW()
         WHERE id = $1;`,
        [item.product_id, item.quantity]
      );
    }

    // Empty the cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1;', [cartId]);

    await client.query('COMMIT');
    return { order };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const findAllByUser = async (userId) => {
  const result = await db.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC;',
    [userId]
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await db.query('SELECT * FROM orders WHERE id = $1;', [id]);
  return result.rows[0];
};

const getItems = async (orderId) => {
  const result = await db.query(
    `SELECT oi.product_id,
            oi.quantity,
            oi.price_at_purchase,
            p.name,
            p.image_url,
            (oi.quantity * oi.price_at_purchase) AS line_total
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.id;`,
    [orderId]
  );
  return result.rows;
};

const updateStatus = async (id, status) => {
  const result = await db.query(
    `UPDATE orders
     SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *;`,
    [id, status]
  );
  return result.rows[0];
};

// Cancel an order and restore the stock, in a transaction
const cancel = async (id) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const items = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1;',
      [id]
    );

    for (const item of items.rows) {
      await client.query(
        'UPDATE products SET stock = stock + $2, updated_at = NOW() WHERE id = $1;',
        [item.product_id, item.quantity]
      );
    }

    const result = await client.query(
      `UPDATE orders
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING *;`,
      [id]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  createFromCart,
  findAllByUser,
  findById,
  getItems,
  updateStatus,
  cancel,
};