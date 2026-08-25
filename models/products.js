const db = require('../db');

const findAll = async ({ category, search } = {}) => {
  const conditions = [];
  const values = [];

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT * FROM products ${where} ORDER BY id;`,
    values
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await db.query('SELECT * FROM products WHERE id = $1;', [id]);
  return result.rows[0];
};

const create = async ({ name, description, price, stock, category, imageUrl }) => {
  const result = await db.query(
    `INSERT INTO products (name, description, price, stock, category, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *;`,
    [name, description || null, price, stock || 0, category || null, imageUrl || null]
  );
  return result.rows[0];
};

const update = async (id, { name, description, price, stock, category, imageUrl }) => {
  const result = await db.query(
    `UPDATE products
     SET name        = COALESCE($2, name),
         description = COALESCE($3, description),
         price       = COALESCE($4, price),
         stock       = COALESCE($5, stock),
         category    = COALESCE($6, category),
         image_url   = COALESCE($7, image_url),
         updated_at  = NOW()
     WHERE id = $1
     RETURNING *;`,
    [
      id,
      name ?? null,
      description ?? null,
      price ?? null,
      stock ?? null,
      category ?? null,
      imageUrl ?? null,
    ]
  );
  return result.rows[0];
};

const remove = async (id) => {
  const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *;', [id]);
  return result.rows[0];
};

module.exports = { findAll, findById, create, update, remove };