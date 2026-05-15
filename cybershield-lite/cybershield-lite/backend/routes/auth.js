const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, dbGet, dbInsert } = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password min 6 chars' });
  try {
    const db = await getDb();
    const exists = dbGet(db, 'SELECT id FROM users WHERE username=? OR email=?', [username, email]);
    if (exists) return res.status(409).json({ error: 'Username or email already taken' });
    const hash = await bcrypt.hash(password, 10);
    const id = dbInsert(db, 'INSERT INTO users (username,email,password) VALUES (?,?,?)', [username, email, hash]);
    req.session.userId = id; req.session.username = username; req.session.role = 'user';
    res.json({ success: true, username });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const db = await getDb();
    const user = dbGet(db, 'SELECT * FROM users WHERE username=?', [username]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.userId = user.id; req.session.username = user.username; req.session.role = user.role;
    res.json({ success: true, username: user.username, role: user.role });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/logout', (req, res) => { req.session.destroy(); res.json({ success: true }); });

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ userId: req.session.userId, username: req.session.username, role: req.session.role });
});

module.exports = router;
