const express = require('express');
const { getDb, dbAll, dbRun } = require('../db');
const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

router.get('/users', requireAdmin, async (req, res) => {
  const db = await getDb();
  res.json(dbAll(db, 'SELECT id,username,email,role,created_at FROM users ORDER BY created_at DESC'));
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
  if (parseInt(req.params.id) === req.session.userId) return res.status(400).json({ error: 'Cannot delete yourself' });
  const db = await getDb();
  dbRun(db, 'DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

router.get('/evidence/:reportId', requireAdmin, async (req, res) => {
  const db = await getDb();
  res.json(dbAll(db, 'SELECT * FROM evidence WHERE report_id=?', [req.params.reportId]));
});

module.exports = router;
