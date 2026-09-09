const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1', port: 5432, user: 'postgres',
  password: 'piyush@13', database: 'cinebook',
});

(async () => {
  const hash = await bcrypt.hash('password123', 10);
  const r1 = await pool.query('UPDATE users SET password_hash=$1 WHERE email=$2', [hash, 'admin@cinebook.com']);
  const r2 = await pool.query('UPDATE users SET password_hash=$1 WHERE email=$2', [hash, 'john@example.com']);
  console.log('admin updated:', r1.rowCount, '| john updated:', r2.rowCount);
  await pool.end();
})();
