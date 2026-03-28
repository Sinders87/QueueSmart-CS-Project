const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { validateRequired, validateString, validateNumber, validateEnum } = require('../utils/validation');

const VALID_PRIORITIES = ['low', 'medium', 'high'];

function validateServiceBody(body) {
  const { name, description, expectedDuration, priority } = body;
  const missing = validateRequired(['name', 'description', 'expectedDuration', 'priority'], body);
  if (missing) return missing;
  const nameErr = validateString(name, 'name', 100);
  if (nameErr) return nameErr;
  const descErr = validateString(description, 'description', 500);
  if (descErr) return descErr;
  const durErr = validateNumber(expectedDuration, 'expectedDuration', 1);
  if (durErr) return durErr;
  const priErr = validateEnum(priority, 'priority', VALID_PRIORITIES);
  if (priErr) return priErr;
  return null;
}

router.get('/', (req, res) => {
  res.json(store.getServices());
});

router.get('/:id', (req, res) => {
  const service = store.getServices().find(s => s.id === parseInt(req.params.id));
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

router.post('/', (req, res) => {
  const err = validateServiceBody(req.body);
  if (err) return res.status(400).json({ error: err });
  const { name, description, expectedDuration, priority, isActive } = req.body;
  const newService = {
    id: store.nextServiceId(),
    name: name.trim(),
    description: description.trim(),
    expectedDuration: Number(expectedDuration),
    priority,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  };
  store.getServices().push(newService);
  res.status(201).json(newService);
});

router.put('/:id', (req, res) => {
  const services = store.getServices();
  const idx = services.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Service not found' });
  const err = validateServiceBody(req.body);
  if (err) return res.status(400).json({ error: err });
  const { name, description, expectedDuration, priority, isActive } = req.body;
  services[idx] = {
    ...services[idx],
    name: name.trim(),
    description: description.trim(),
    expectedDuration: Number(expectedDuration),
    priority,
    isActive: isActive !== undefined ? Boolean(isActive) : services[idx].isActive
  };
  res.json(services[idx]);
});

module.exports = router;