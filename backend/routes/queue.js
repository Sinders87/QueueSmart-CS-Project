const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { validateRequired, validateString } = require('../utils/validation');
const { recalcWaitTimes, estimateWait } = require('../utils/waitTime');
//const { addNotification } = require('../utils/notificationsDb');

router.get('/', (req, res) => {
  res.json(store.getQueue());
});

router.get('/service/:serviceId', (req, res) => {
  const sid = parseInt(req.params.serviceId);
  const entries = store.getQueue().filter(e => e.serviceId === sid);
  res.json(entries);
});

router.get('/user/:userName', (req, res) => {
  const entry = store.getQueue().find(
    e => e.userName === req.params.userName && e.status === 'waiting'
  );
  if (!entry) return res.status(404).json({ error: 'User not found in queue' });
  res.json(entry);
});

router.post('/join', async (req, res) => {
  const { serviceId, userName } = req.body;
  const missing = validateRequired(['serviceId', 'userName'], req.body);
  if (missing) return res.status(400).json({ error: missing });
  const nameErr = validateString(userName, 'userName', 100);
  if (nameErr) return res.status(400).json({ error: nameErr });
  const sid = parseInt(serviceId);
  const service = store.getServices().find(s => s.id === sid);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  if (!service.isActive) return res.status(400).json({ error: 'Service is not currently active' });
  const alreadyIn = store.getQueue().find(
    e => e.serviceId === sid && e.userName === userName && e.status === 'waiting'
  );
  if (alreadyIn) return res.status(409).json({ error: 'User is already in this queue' });
  const waitingInService = store.getQueue().filter(
    e => e.serviceId === sid && e.status === 'waiting'
  );
  const position = waitingInService.length + 1;
  const estimatedWait = estimateWait(service, position);
  const newEntry = {
    id: store.nextQueueId(),
    serviceId: sid,
    userName: userName.trim(),
    status: 'waiting',
    position,
    estimatedWait
  };
  store.getQueue().push(newEntry);
  store.addNotification(
    `You joined ${service.name}. Current position: ${position}`,
    userName,
    'user'
  );
  res.status(201).json(newEntry);
});

router.delete('/leave', (req, res) => {
  const { serviceId, userName } = req.body;
  const missing = validateRequired(['serviceId', 'userName'], req.body);
  if (missing) return res.status(400).json({ error: missing });
  const sid = parseInt(serviceId);
  const queue = store.getQueue();
  const idx = queue.findIndex(
    e => e.serviceId === sid && e.userName === userName && e.status === 'waiting'
  );
  if (idx === -1) return res.status(404).json({ error: 'User not found in queue' });
  const [removed] = queue.splice(idx, 1);
  const service = store.getServices().find(s => s.id === sid);
  store.getHistory().push({
    id: store.nextHistoryId(),
    serviceId: sid,
    serviceName: service ? service.name : 'Unknown',
    date: new Date().toISOString().split('T')[0],
    outcome: 'left',
    userName
  });
  recalcWaitTimes(queue, service);
  res.json({ message: 'Left queue successfully', entry: removed });
});

router.post('/serve-next/:serviceId', (req, res) => {
  const sid = parseInt(req.params.serviceId);
  const queue = store.getQueue();
  const waiting = queue
    .filter(e => e.serviceId === sid && e.status === 'waiting')
    .sort((a, b) => a.position - b.position);
  if (waiting.length === 0) {
    return res.status(404).json({ error: 'No users waiting for this service' });
  }
  if (waiting.length >= 2) {
    const nextUp = waiting[1];
    store.addNotification(
      `You are almost ready to be served for ${store.getServices().find(s => s.id === sid)?.name}`,
      nextUp.userName,
      'user'
    );
  }
  const served = waiting[0];
  const idx = queue.findIndex(e => e.id === served.id);
  queue.splice(idx, 1);
  const service = store.getServices().find(s => s.id === sid);
  store.getHistory().push({
    id: store.nextHistoryId(),
    serviceId: sid,
    serviceName: service ? service.name : 'Unknown',
    date: new Date().toISOString().split('T')[0],
    outcome: 'served',
    userName: served.userName
  });
  recalcWaitTimes(queue, service);
  res.json({ message: `${served.userName} is now being served`, entry: served });
});

module.exports = router;