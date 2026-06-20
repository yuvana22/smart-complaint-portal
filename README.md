# Smart Complaint Management Portal

A full-stack web application for citizens to report public civic issues (roads, drainage,
water supply, electricity, etc.) which are **automatically routed to the responsible
sector** based on Area Name and Pin Code. Admins can view, filter, update, and resolve
complaints through a dedicated dashboard with sector-wise analytics and map visualization.

Built for final-year CSP (Computer Science Project) demonstration.

---

## Tech Stack

| Layer          | Technology                                  |
|----------------|----------------------------------------------|
| Frontend       | HTML, CSS, Bootstrap 5, Vanilla JavaScript    |
| Templating     | EJS                                           |
| Backend        | Node.js, Express.js                           |
| Database       | MySQL                                         |
| Auth           | express-session + bcrypt password hashing    |
| Maps           | Leaflet.js + OpenStreetMap (no API key needed)|
| Charts         | Chart.js (Sector-wise Complaint Analytics)    |
| File Upload    | Multer                                        |

---

## Folder Structure

```
smart-complaint-portal/
├── config/
│   └── db.js                  # MySQL connection pool
├── controllers/
│   ├── authController.js      # Register/Login/Logout logic (user + admin)
│   ├── userController.js      # Dashboard, raise/view/track complaints
│   └── adminController.js     # Admin dashboard, complaint management
├── database/
│   ├── schema.sql             # Tables + area_sector mapping data
│   └── seed.js                # Creates admin/users (bcrypt-hashed) + sample complaints
├── middleware/
│   ├── authMiddleware.js       # Route protection (user/admin session checks)
│   └── uploadMiddleware.js     # Multer config for complaint image uploads
├── models/
│   ├── userModel.js
│   ├── adminModel.js
│   ├── areaSectorModel.js     # Area -> Sector auto-mapping logic
│   └── complaintModel.js      # All complaint queries (CRUD, stats, filters)
├── routes/
│   ├── homeRoutes.js
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── adminRoutes.js
├── public/
│   ├── css/style.css
│   └── uploads/               # Uploaded complaint images land here
├── views/
│   ├── partials/               # head, navbars, sidebar, alerts
│   ├── user/                   # dashboard, raise-complaint, my-complaints, track
│   ├── admin/                  # admin-login, admin-dashboard, manage-complaints, details
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   └── 404.ejs
├── server.js                   # App entry point
├── package.json
├── .env.example
└── README.md
```

---

## Setup Instructions

### 1. Prerequisites
- Node.js v16+ installed
- MySQL Server installed and running

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example file and fill in your MySQL credentials:
```bash
cp .env.example .env
```
Edit `.env`:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=complaint_portal
DB_PORT=3306
SESSION_SECRET=any_long_random_string
```

### 4. Set up the database (run in this exact order)

**Step A — Create tables and area-sector mapping:**
```bash
mysql -u root -p < database/schema.sql
```

**Step B — Seed admin account, sample users, and sample complaints**
(this generates real bcrypt password hashes on your machine — don't skip this step):
```bash
node database/seed.js
```

You should see output confirming the admin account, 3 sample users, and 7 sample
complaints were created.

### 5. Start the server
```bash
npm start
```
Or for auto-reload during development:
```bash
npm run dev
```

### 6. Open the app
Visit **http://localhost:3000**

---

## Default Login Credentials

| Role  | Username / Email             | Password   |
|-------|-------------------------------|------------|
| Admin | `admin`                       | `admin123` |
| User  | `ravi.kumar@example.com`      | `test1234` |
| User  | `priya.sharma@example.com`    | `test1234` |
| User  | `arjun.rao@example.com`       | `test1234` |

Admin login is at **/admin/login** (separate from the user login page).

---

## Area → Sector Auto-Mapping

The `area_sector` table pre-loaded by `schema.sql` contains:

| Area Name        | Sector   | Pin Code |
|-------------------|----------|----------|
| MVP Colony        | Sector 1 | 530017   |
| Gajuwaka           | Sector 2 | 530026   |
| Madhurawada        | Sector 3 | 530048   |
| Dwaraka Nagar      | Sector 4 | 530016   |
| Seethammadhara     | Sector 5 | 530013   |

When a user types an Area Name or Pin Code on the **Raise Complaint** page, an AJAX
call hits `/complaints/detect-sector` which matches against this table (exact area+pincode
match first, then area-only, then pincode-only) and displays the assigned sector plus a
live Leaflet map preview using that area's fixed coordinates — before the form is even
submitted. If no match is found, the complaint is saved with sector `"Unassigned"`.

To add more areas, just insert more rows into `area_sector` with their lat/lng.

---

## Key Features Implemented

- Session-based auth for both users and admins (separate login flows)
- bcrypt password hashing, parameterized SQL queries (no SQL injection)
- Auto sector detection via AJAX as the user types
- Unique complaint ID generation (`CMP-1001`, `CMP-1002`, ...)
- Optional image upload (Multer, 5MB limit, image-only filter)
- Complaint tracking by ID for citizens
- Admin dashboard with live stats + **Sector-wise Complaint Analytics** bar chart (Chart.js)
- Admin complaint management: search, filter by sector/status, sort by date, inline
  status update, delete with confirmation
- Leaflet + OpenStreetMap map on complaint details/tracking pages (no API key required)
- Fully responsive Bootstrap 5 UI

---

## Notes for Demo / Faculty Evaluation

- The **Sector-wise Complaint Analytics** chart on the admin dashboard (`/admin/dashboard`)
  visually shows complaint volume per sector — useful for demonstrating social impact.
- Sample data (7 complaints across all 5 sectors and all 3 statuses) is included so the
  charts and tables aren't empty on first run.
- All passwords are hashed with bcrypt (10 salt rounds); none are stored in plain text.
- To reset the database at any point, simply re-run `schema.sql` (it drops and recreates
  tables) followed by `node database/seed.js`.
