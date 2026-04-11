const express = require('express');
const router = express.Router();
const { getAllHistory, getHistoryByUser, markAsViewed } = require('../data/historyDb');

router.get('/', async (req, res) => {
  try {
    const history = await getAllHistory();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get history' });
  }
});

router.get('/user/:userName', async (req, res) => {
  try {
    const entries = await getHistoryByUser(req.params.userName);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user history' });
  }
});

router.get('/notifications/:userName', async (req, res) => {
  try {
    const notes = await getHistoryByUser(req.params.userName);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

router.patch('/notifications/:id/viewed', async (req, res) => {
  try {
    const result = await markAsViewed(req.params.id);
    if (result.updated === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as viewed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification status' });
  }
});

module.exports = router;