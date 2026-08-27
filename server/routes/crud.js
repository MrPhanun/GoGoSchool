const express = require('express');
const db = require('../db');

function crudRouter(tableName, { allowCreate = true } = {}) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      res.json(await db.readTable(tableName));
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const row = await db.findById(tableName, req.params.id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  if (allowCreate) {
    router.post('/', async (req, res) => {
      try {
        const row = await db.insert(tableName, req.body || {});
        res.status(201).json(row);
      } catch (err) {
        res.status(500).json({ error: 'Database error' });
      }
    });
  }

  router.put('/:id', async (req, res) => {
    try {
      const row = await db.update(tableName, req.params.id, req.body || {});
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const ok = await db.remove(tableName, req.params.id);
      if (!ok) return res.status(404).json({ error: 'Not found' });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
}

module.exports = crudRouter;
