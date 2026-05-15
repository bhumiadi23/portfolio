const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'cybershield.db');
let _db = null;

async function getDb() {
  if (_db) return _db;
  const SQL = await initSqlJs();
  _db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  _db.run(`PRAGMA foreign_keys = ON;`);
  _db.run(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'user', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, scam_number TEXT, suspicious_url TEXT, fraud_type TEXT NOT NULL, description TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id));
    CREATE TABLE IF NOT EXISTS evidence (id INTEGER PRIMARY KEY AUTOINCREMENT, report_id INTEGER NOT NULL, file_name TEXT NOT NULL, file_path TEXT NOT NULL, uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE);
  `);

  const existing = _db.exec("SELECT id FROM users WHERE username='admin'");
  if (!existing.length || !existing[0].values.length) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('password', 10);
    _db.run("INSERT INTO users (username,email,password,role) VALUES ('admin','admin@cybershield.io','" + hash + "','admin')");
    const samples = [
      [1,'+1-800-555-0199','http://paypa1-secure.xyz','Phishing','Fake PayPal login page stealing credentials','solved'],
      [1,'+1-900-555-0142',null,'Phone Scam','IRS impersonation demanding gift cards','pending'],
      [1,null,'http://amaz0n-verify.net','Phishing','Amazon account verification scam','pending'],
      [1,'+44-20-555-0167','http://crypto-double.io','Crypto Fraud','Bitcoin doubling investment scam','investigating'],
      [1,'+1-888-555-0123',null,'Tech Support Scam','Microsoft support popup virus scam','solved'],
      [1,null,'http://bank0famerica-login.com','Banking Fraud','Fake Bank of America login page','pending'],
      [1,'+1-700-555-0198','http://lottery-winner-2024.com','Lottery Scam','Fake lottery winning notification','investigating'],
      [1,'+91-98765-43210',null,'Phone Scam','Fake KYC update call for banking','pending'],
    ];
    for (const r of samples) {
      const url = r[2] ? `'${r[2]}'` : 'NULL';
      const num = r[1] ? `'${r[1]}'` : 'NULL';
      _db.run(`INSERT INTO reports (user_id,scam_number,suspicious_url,fraud_type,description,status) VALUES (${r[0]},${num},${url},'${r[3]}','${r[4]}','${r[5]}')`);
    }
  }
  save();
  return _db;
}

function save() {
  if (!_db) return;
  fs.writeFileSync(DB_PATH, Buffer.from(_db.export()));
}

function esc(p) {
  if (p === null || p === undefined) return 'NULL';
  if (typeof p === 'number') return p;
  return `'${String(p).replace(/'/g, "''")}'`;
}

function interpolate(sql, params = []) {
  let i = 0;
  return sql.replace(/\?/g, () => esc(params[i++]));
}

function dbAll(db, sql, params = []) {
  const res = db.exec(interpolate(sql, params));
  if (!res.length) return [];
  const { columns, values } = res[0];
  return values.map(row => Object.fromEntries(columns.map((c, j) => [c, row[j]])));
}

function dbGet(db, sql, params = []) {
  const rows = dbAll(db, sql, params);
  return rows[0] || null;
}

function dbRun(db, sql, params = []) {
  db.run(interpolate(sql, params));
  save();
}

function dbInsert(db, sql, params = []) {
  db.run(interpolate(sql, params));
  const row = dbGet(db, 'SELECT last_insert_rowid() as id');
  save();
  return row ? row.id : null;
}

module.exports = { getDb, dbRun, dbGet, dbAll, dbInsert, save };
