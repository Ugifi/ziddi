const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30',
  dateStrings: true  // <--- YEH NAYI LINE ADD KARNI HAI
});

const db = pool.promise();

// Test connection
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err.message);
  } else {
    console.log('✅ MySQL Connected Successfully');
    conn.release();
  }
});

module.exports = db;
