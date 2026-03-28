const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  res.json(store.getHistory());
});

router.get('/user/:userName', (req, res) => {
  const entries = store.getHistory().filter(
    h => h.userName === req.params.userName
  );
  res.json(entries);
});

router.get('/notifications/:userName', (req, res) => {
  const notes = store.getNotifications().filter(
    n => n.userName === req.params.userName
  );
  res.json(notes);
});

module.exports = router;