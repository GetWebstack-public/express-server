const mysql = require('mysql2/promise');

const url = new URL(process.env.DATABASE_URL);

const pool = mysql.createPool({
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
