const db = require('../db');

const findByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1;', [email]);
  return result.rows[0];
};

const findById = async (id) => {
  const result = await db.query(
    'SELECT id, email, first_name, last_name, address, created_at FROM users WHERE id = $1;',
    [id]
  );
  return result.rows[0];
};

const create = async ({ email, password, firstName, lastName, address }) => {
  const result = await db.query(
    `INSERT INTO users (email, password, first_name, last_name, address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name, last_name, address, created_at;`,
    [email, password, firstName || null, lastName || null, address || null]
  );
  return result.rows[0];
};

const update = async (id, { firstName, lastName, address }) => {
  const result = await db.query(
    `UPDATE users
     SET first_name = COALESCE($2, first_name),
         last_name  = COALESCE($3, last_name),
         address    = COALESCE($4, address),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, first_name, last_name, address, created_at, updated_at;`,
    [id, firstName || null, lastName || null, address || null]
  );
  return result.rows[0];
};

const remove = async (id) => {
  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id;', [id]);
  return result.rows[0];
};

module.exports = { findByEmail, findById, create, update, remove };