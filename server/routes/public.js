const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/announcements', async (req, res) => {
  try {
    const announcements = (await db.readTable('announcements'))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/inquiries', async (req, res) => {
  const { parentName, email, phone, childAge, message } = req.body || {};
  if (!parentName || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  try {
    const row = await db.insert('inquiries', {
      parentName,
      email,
      phone: phone || '',
      childAge: childAge || '',
      message,
      submittedAt: new Date(),
      status: 'new',
    });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
