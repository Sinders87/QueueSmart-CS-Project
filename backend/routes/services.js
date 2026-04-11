const express = require('express');
const router = express.Router();
const { validateRequired, validateString, validateNumber, validateEnum } = require('../utils/validation');
const { getAllServices, getServiceById, createService, updateService } = require('../data/servicesDb');

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

router.get('/', async (req, res) => {
  try {
    const services = await getAllServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get services' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const service = await getServiceById(parseInt(req.params.id));
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get service' });
  }
});

router.post('/', async (req, res) => {
  try {
    const err = validateServiceBody(req.body);
    if (err) return res.status(400).json({ error: err });
    const { name, description, expectedDuration, priority, isActive } = req.body;
    const newService = await createService({
      name: name.trim(),
      description: description.trim(),
      expectedDuration: Number(expectedDuration),
      priority,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const err = validateServiceBody(req.body);
    if (err) return res.status(400).json({ error: err });
    const existing = await getServiceById(parseInt(req.params.id));
    if (!existing) return res.status(404).json({ error: 'Service not found' });
    const { name, description, expectedDuration, priority, isActive } = req.body;
    const updated = await updateService(parseInt(req.params.id), {
      name: name.trim(),
      description: description.trim(),
      expectedDuration: Number(expectedDuration),
      priority,
      isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

module.exports = router;