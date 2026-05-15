-- CyberShield Lite Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  scam_number TEXT,
  suspicious_url TEXT,
  fraud_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Sample admin user (password: admin123)
INSERT OR IGNORE INTO users (username, email, password, role)
VALUES ('admin', 'admin@cybershield.io', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Sample data
INSERT OR IGNORE INTO reports (user_id, scam_number, suspicious_url, fraud_type, description, status, created_at) VALUES
(1, '+1-800-555-0199', 'http://paypa1-secure.xyz', 'Phishing', 'Fake PayPal login page stealing credentials', 'solved', '2024-01-15 10:30:00'),
(1, '+1-900-555-0142', NULL, 'Phone Scam', 'IRS impersonation demanding gift cards', 'pending', '2024-01-16 14:22:00'),
(1, NULL, 'http://amaz0n-verify.net', 'Phishing', 'Amazon account verification scam', 'pending', '2024-01-17 09:15:00'),
(1, '+44-20-555-0167', 'http://crypto-double.io', 'Crypto Fraud', 'Bitcoin doubling investment scam', 'investigating', '2024-01-18 16:45:00'),
(1, '+1-888-555-0123', NULL, 'Tech Support Scam', 'Microsoft support popup virus scam', 'solved', '2024-01-19 11:00:00'),
(1, NULL, 'http://bank0famerica-login.com', 'Banking Fraud', 'Fake Bank of America login page', 'pending', '2024-01-20 08:30:00'),
(1, '+1-700-555-0198', 'http://lottery-winner-2024.com', 'Lottery Scam', 'Fake lottery winning notification', 'investigating', '2024-01-21 13:20:00'),
(1, '+91-98765-43210', NULL, 'Phone Scam', 'Fake KYC update call for banking', 'pending', '2024-01-22 10:10:00');
