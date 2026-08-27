require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const crudRouter = require('./routes/crud');
const { requireLogin, requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'gogo-school-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 },
}));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

app.use('/api/students', requireLogin, crudRouter('students'));
app.use('/api/classes', requireLogin, crudRouter('classes'));
app.use('/api/teachers', requireLogin, crudRouter('teachers'));
app.use('/api/attendance', requireLogin, crudRouter('attendance'));
app.use('/api/fees', requireLogin, crudRouter('fees'));
app.use('/api/announcements', requireLogin, crudRouter('announcements'));
app.use('/api/inquiries', requireLogin, crudRouter('inquiries', { allowCreate: false }));

app.get('/api/dashboard', requireLogin, async (req, res) => {
  try {
    const db = require('./db');
    const [students, classes, teachers, fees, inquiries, attendance] = await Promise.all([
      db.readTable('students'),
      db.readTable('classes'),
      db.readTable('teachers'),
      db.readTable('fees'),
      db.readTable('inquiries'),
      db.readTable('attendance'),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const attendanceToday = attendance.filter((a) => new Date(a.date).toISOString().slice(0, 10) === today);

    res.json({
      totalStudents: students.length,
      totalClasses: classes.length,
      totalTeachers: teachers.length,
      unpaidFees: fees.filter((f) => f.status === 'unpaid').length,
      newInquiries: inquiries.filter((i) => i.status === 'new').length,
      presentToday: attendanceToday.filter((a) => a.status === 'present').length,
      attendanceMarkedToday: attendanceToday.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`GO-GO International School server running at http://localhost:${PORT}`);
});
