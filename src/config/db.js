const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error connecting to database:', err);
  }
  console.log('Connected to PostgreSQL database successfully');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};