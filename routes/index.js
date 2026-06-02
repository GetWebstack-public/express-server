var express = require('express');
var router = express.Router();
var db = require('../db');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET API endpoint for messages */
router.get('/api/message', function(req, res) {
  res.json({
    message: 'Hello from the API!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/* GET API endpoint to test environment variables */
router.get('/api/env-test', function(req, res) {
  res.json({
    message: 'Environment variables test',
    environment: process.env.ENVIRONMENT || 'not set',
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasApiKey: !!process.env.API_KEY,
    timestamp: new Date().toISOString()
  });
});

/* GET API endpoint to test database connectivity */
router.get('/api/db-test', async function(req, res) {
  try {
    const [rows] = await db.query('SELECT DATABASE() AS db, USER() AS user, NOW() AS time');
    res.json({
      connected: true,
      database: rows[0].db,
      user: rows[0].user,
      serverTime: rows[0].time,
    });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

/* GET API endpoint for user info */
router.get('/api/users/:name', function(req, res) {
  res.json({
    name: req.params.name,
    greeting: `Welcome, ${req.params.name}!`,
    timestamp: new Date().toISOString()
  });
});

/* POST /api/register — create user in DB */
router.post('/api/register', async function(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash]
    );
    res.status(201).json({ success: true, message: `User ${name} registered successfully` });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
});

/* POST /api/login */
router.post('/api/login', async function(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
