const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'cinebook',
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected:', process.env.DB_NAME);
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL idle client error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
