const express = require('express');
const router = express.Router();
const { validateRequired, validateString } = require('../utils/validation');
const { getQueue, getQueueByService, getQueueEntryByUser, joinQueue, leaveQueue, serveNext, recalcPositions } = require('../data/queueDb');
const { getServiceById } = require('../data/servicesDb');
const { addHistoryEntry } = require('../data/historyDb');

router.get('/', async (req, res) => {
  try {
    const queue = await getQueue();
    res.json(queue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get queue' });
  }
});

router.get('/service/:serviceId', async (req, res) => {
  try {
    const entries = await getQueueByService(parseInt(req.params.serviceId));
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get queue for service' });
  }
});

router.get('/user/:userName', async (req, res) => {
  try {
    const entry = await getQueueEntryByUser(req.params.userName);
    if (!entry) return res.status(404).json({ error: 'User not found in queue' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user queue entry' });
  }
});

router.post('/join', async (req, res) => {
  try {
    const { serviceId, userName } = req.body;

    const missing = validateRequired(['serviceId', 'userName'], req.body);
    if (missing) return res.status(400).json({ error: missing });

    const nameErr = validateString(userName, 'userName', 100);
    if (nameErr) return res.status(400).json({ error: nameErr });

    const sid = parseInt(serviceId);
    const service = await getServiceById(sid);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    if (!service.isActive) return res.status(400).json({ error: 'Service is not currently active' });

    const alreadyIn = await getQueueEntryByUser(userName);
    if (alreadyIn && alreadyIn.serviceId === sid) {
      return res.status(409).json({ error: 'User is already in this queue' });
    }

    const currentQueue = await getQueueByService(sid);
    const position = currentQueue.length + 1;
    const estimatedWait = Math.max(0, (position - 1) * service.expectedDuration);

    const newEntry = await joinQueue({ serviceId: sid, userName: userName.trim(), position, estimatedWait });

    await addHistoryEntry({
      userName: userName.trim(),
      message: `You joined ${service.name}. Current position: ${position}`,
      role: 'user'
    });

    res.status(201).json(newEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join queue' });
  }
});

router.delete('/leave', async (req, res) => {
  try {
    const { serviceId, userName } = req.body;

    const missing = validateRequired(['serviceId', 'userName'], req.body);
    if (missing) return res.status(400).json({ error: missing });

    const sid = parseInt(serviceId);
    const result = await leaveQueue(sid, userName);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found in queue' });
    }

    await recalcPositions(sid);

    const service = await getServiceById(sid);
    await addHistoryEntry({
      userName,
      message: `You left ${service ? service.name : 'the queue'}.`,
      role: 'user'
    });

    res.json({ message: 'Left queue successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to leave queue' });
  }
});

router.post('/serve-next/:serviceId', async (req, res) => {
  try {
    const sid = parseInt(req.params.serviceId);
    const served = await serveNext(sid);

    if (!served) {
      return res.status(404).json({ error: 'No users waiting for this service' });
    }

    await recalcPositions(sid);

    const remaining = await getQueueByService(sid);
    if (remaining.length >= 1) {
      const nextUp = remaining[0];
      const service = await getServiceById(sid);
      await addHistoryEntry({
        userName: nextUp.userName,
        message: `You are almost ready to be served for ${service ? service.name : 'your service'}`,
        role: 'user'
      });
    }

    res.json({ message: `${served.userName} is now being served`, entry: served });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to serve next user' });
  }
});

module.exports = router;