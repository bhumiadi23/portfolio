const express = require('express');
const multer = require('multer');
const path = require('path');
const { getDb, dbAll, dbGet, dbRun, dbInsert } = require('../db');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 5*1024*1024 },
  fileFilter: (req, file, cb) => ['image/jpeg','image/png','image/gif','application/pdf'].includes(file.mimetype) ? cb(null,true) : cb(new Error('Invalid file type'))
});

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required' });
  next();
}

router.post('/', requireAuth, upload.array('evidence', 5), async (req, res) => {
  const { scam_number, suspicious_url, fraud_type, description } = req.body;
  if (!fraud_type || !description) return res.status(400).json({ error: 'Fraud type and description required' });
  const db = await getDb();
  const id = dbInsert(db, 'INSERT INTO reports (user_id,scam_number,suspicious_url,fraud_type,description) VALUES (?,?,?,?,?)',
    [req.session.userId, scam_number||null, suspicious_url||null, fraud_type, description]);
  if (req.files?.length) {
    for (const f of req.files) dbInsert(db, 'INSERT INTO evidence (report_id,file_name,file_path) VALUES (?,?,?)', [id, f.originalname, f.filename]);
  }
  res.json({ success: true, reportId: id });
});

router.get('/', async (req, res) => {
  const { fraud_type, status, search, limit = 50, offset = 0 } = req.query;
  const db = await getDb();
  let sql = 'SELECT r.*, u.username FROM reports r LEFT JOIN users u ON r.user_id=u.id WHERE 1=1';
  const p = [];
  if (fraud_type) { sql += ' AND r.fraud_type=?'; p.push(fraud_type); }
  if (status) { sql += ' AND r.status=?'; p.push(status); }
  if (search) { sql += ' AND (r.scam_number LIKE ? OR r.suspicious_url LIKE ? OR r.description LIKE ?)'; p.push(`%${search}%`,`%${search}%`,`%${search}%`); }
  sql += ` ORDER BY r.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
  res.json(dbAll(db, sql, p));
});

router.get('/stats', async (req, res) => {
  const db = await getDb();
  const total = dbGet(db, 'SELECT COUNT(*) as c FROM reports').c;
  const solved = dbGet(db, "SELECT COUNT(*) as c FROM reports WHERE status='solved'").c;
  const pending = dbGet(db, "SELECT COUNT(*) as c FROM reports WHERE status='pending'").c;
  const investigating = dbGet(db, "SELECT COUNT(*) as c FROM reports WHERE status='investigating'").c;
  const byType = dbAll(db, 'SELECT fraud_type, COUNT(*) as count FROM reports GROUP BY fraud_type ORDER BY count DESC');
  const recent = dbAll(db, 'SELECT r.*, u.username FROM reports r LEFT JOIN users u ON r.user_id=u.id ORDER BY r.created_at DESC LIMIT 5');
  const byDay = dbAll(db, "SELECT DATE(created_at) as day, COUNT(*) as count FROM reports GROUP BY day ORDER BY day DESC LIMIT 7");
  res.json({ total, solved, pending, investigating, byType, recent, byDay: byDay.reverse() });
});

router.get('/number/:num', async (req, res) => {
  const db = await getDb();
  const reports = dbAll(db, 'SELECT * FROM reports WHERE scam_number LIKE ? ORDER BY created_at DESC', [`%${req.params.num}%`]);
  res.json({ count: reports.length, reports });
});

router.get('/url-check', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });
  const domain = url.replace(/https?:\/\//, '').split('/')[0];
  const db = await getDb();
  const reports = dbAll(db, 'SELECT * FROM reports WHERE suspicious_url LIKE ? ORDER BY created_at DESC', [`%${domain}%`]);
  const risk = reports.length === 0 ? 'low' : reports.length < 3 ? 'medium' : 'high';
  res.json({ domain, risk, reportCount: reports.length, reports });
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = await getDb();
  dbRun(db, 'UPDATE reports SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.json({ success: true });
});

router.delete('/:id', requireAuth, async (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = await getDb();
  dbRun(db, 'DELETE FROM reports WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
