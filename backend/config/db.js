const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 100,
  connectTimeout: 10000,
  timezone: '+05:30',
  dateStrings: true
});

const db = pool.promise();

db.query("SET time_zone = '+05:30'").then(() => {
  console.log('✅ Timezone set to IST');
}).catch(err => {
  console.error('Timezone set error:', err.message);
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err.message);
  } else {
    console.log('✅ MySQL Connected Successfully');
    conn.release();
  }
});

module.exports = db;
