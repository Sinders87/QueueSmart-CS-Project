const express = require('express');
const router = express.Router();
const store = require('../data/store');
//const db = require('../data/db');

router.get('/', (req, res) => {
  res.json(store.getHistory());
});

router.get('/user/:userName', (req, res) => {
  const entries = store.getHistory().filter(
    h => h.userName === req.params.userName
  );
  res.json(entries);
});

router.get('/notifications/:userName', async (req, res) => {
  try {
    const notes = await store.getNotifications();
    const filtered = notes.filter(
      n => n.userName === req.params.userName
    );
    res.json(filtered);
  }
  catch(err) {
    res.status(500).json({ error: 'Cannot get notifications' })
  }
});

router.patch('/notifications/:id/viewed', async (req,res) => {
  try {
    const result = await store.markAsViewed(req.params.id);

    if (result.updated === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification is viewed' });
  }

  catch(err) {
    res.status(500).json({ error: 'Failed to update notification status' });
  }
});

module.exports = router;