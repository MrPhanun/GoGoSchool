# GO-GO International School — Website & Management System

A public marketing website plus a password-protected admin panel for managing
students, classes, teachers, attendance, fees, announcements, and enrollment
inquiries.

## Tech Stack

- Node.js + Express backend (`server/`)
- Plain HTML/CSS/JS frontend, no build step (`public/`)
- **Microsoft SQL Server** for data storage, via the `mssql` driver
- Session-based authentication with hashed passwords (bcryptjs)

## Getting Started

### 1. Set up the database

Requires a running SQL Server instance with mixed-mode (SQL Server)
authentication enabled. Edit `server/sql/schema.sql` and set a real password
in place of `CHANGE_ME_PASSWORD`, then run it:

```
sqlcmd -S localhost -E -C -i server/sql/schema.sql
```

This creates:
- A SQL login `gogo_app` (used by the app to connect)
- The `GoGoSchoolDB` database
- All tables (`users`, `students`, `classes`, `teachers`, `attendance`,
  `fees`, `announcements`, `inquiries`)
- Seed/demo data

### 2. Configure the app

Copy `.env.example` to `.env` and fill in your database connection details:

```
PORT=3000
SESSION_SECRET=change-this-to-a-long-random-string

DB_SERVER=localhost
DB_PORT=1433
DB_NAME=GoGoSchoolDB
DB_USER=gogo_app
DB_PASSWORD=the-password-you-set-in-schema.sql
```

**Important:** if your password contains `#` or `"`, wrap the value in double
quotes in `.env` (e.g. `DB_PASSWORD="my#pass"`), otherwise dotenv will treat
`#` as a comment and truncate the value.

### 3. Run it

```
npm install
npm start
```

Then open http://localhost:3000 in your browser.

## Admin Panel

Go to http://localhost:3000/admin/login.html and sign in with one of the demo
accounts:

- Admin: `admin@gogo.edu` / `Admin@123`
- Teacher: `teacher@gogo.edu` / `Teacher@123`

From the admin panel you can manage:

- **Students** — add/edit/remove student records and assign them to classes
- **Classes** — manage class rooms, age groups, teachers, and capacity
- **Teachers** — manage teacher/staff records
- **Attendance** — mark daily attendance per class
- **Fees** — track tuition fee records and payment status
- **Announcements** — publish updates that appear on the public homepage
- **Inquiries** — view enrollment inquiries submitted through the public
  Contact page

## Project Structure

```
server/
  server.js        Express app entry point
  db.js            SQL Server data layer (mssql driver)
  sql/schema.sql   Database/login/table creation + seed data script
  routes/          API route handlers
  middleware/      Auth middleware
public/
  index.html, about.html, programs.html, gallery.html, staff.html, contact.html
  css/, js/        Public site styles and scripts
  admin/           Admin panel pages, styles, and scripts
```

## Notes

- `.env` holds real credentials and is git-ignored — never commit it. Share
  `.env.example` instead.
- Change `SESSION_SECRET` and the `gogo_app` SQL password before deploying
  anywhere public.
- The `gogo_app` SQL login is granted `db_owner` on `GoGoSchoolDB` only, not
  server-wide access.
