# CyberShield Lite 🛡️
> Cybercrime Reporting & Fraud Investigation System

## Quick Start

```bash
cd cybershield-lite
npm install
npm start
```
Open: http://localhost:3000

## Demo Login
- **Admin**: `admin` / `password`
- Register a new user at `/register.html`

## Stack
- Frontend: HTML5 + CSS3 + Vanilla JS
- Backend: Node.js + Express
- Database: SQLite (auto-created on first run)

## Project Structure
```
cybershield-lite/
├── index.html        # Landing page
├── login.html        # Auth
├── register.html     # Registration
├── dashboard.html    # Stats & charts
├── report.html       # Submit scam report
├── search.html       # Browse/search + URL/number check
├── admin.html        # Admin panel (admin role only)
├── css/style.css     # All styles
├── js/app.js         # Core JS utilities
├── js/sidebar.js     # Sidebar renderer
├── backend/
│   ├── server.js     # Express entry point
│   ├── db.js         # SQLite connection
│   └── routes/
│       ├── auth.js   # Login/register/logout
│       ├── reports.js # CRUD + stats + search
│       └── admin.js  # User management
├── uploads/          # Evidence files stored here
└── database.sql      # Schema + sample data
```

## Features
- User auth with bcrypt password hashing
- Scam report submission with file upload
- Dashboard with live charts (no libraries)
- Number intelligence lookup
- URL threat checker with risk levels
- Admin panel: manage reports, users, status
- Search & filter by type/status
- Mobile responsive
