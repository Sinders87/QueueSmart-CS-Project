const request = require('supertest');
const app = require('../server');
const store = require('../data/store');
const { estimateWait, recalcWaitTimes } = require('../utils/waitTime');
const { validateRequired, validateString, validateNumber, validateEnum } = require('../utils/validation');

beforeEach(() => store.reset());

describe('Validation utils', () => {
  test('validateRequired returns error for missing field', () => {
    expect(validateRequired(['name'], {})).toBe('name is required');
  });
  test('validateRequired returns null when all fields present', () => {
    expect(validateRequired(['name'], { name: 'Test' })).toBeNull();
  });
  test('validateRequired catches empty string', () => {
    expect(validateRequired(['name'], { name: '' })).toBe('name is required');
  });
  test('validateString rejects non-string', () => {
    expect(validateString(123, 'field')).toMatch(/must be a string/);
  });
  test('validateString rejects empty string', () => {
    expect(validateString('  ', 'field')).toMatch(/cannot be empty/);
  });
  test('validateString rejects over max length', () => {
    expect(validateString('a'.repeat(300), 'field', 255)).toMatch(/255 characters/);
  });
  test('validateString accepts valid string', () => {
    expect(validateString('hello', 'field')).toBeNull();
  });
  test('validateNumber rejects non-number', () => {
    expect(validateNumber('abc', 'field')).toMatch(/must be a number/);
  });
  test('validateNumber rejects below minimum', () => {
    expect(validateNumber(0, 'field', 1)).toMatch(/at least 1/);
  });
  test('validateNumber accepts valid number', () => {
    expect(validateNumber(5, 'field', 1)).toBeNull();
  });
  test('validateEnum rejects invalid value', () => {
    expect(validateEnum('extreme', 'priority', ['low', 'medium', 'high'])).toMatch(/one of/);
  });
  test('validateEnum accepts valid value', () => {
    expect(validateEnum('high', 'priority', ['low', 'medium', 'high'])).toBeNull();
  });
});

describe('Wait-time estimation', () => {
  test('position 1 has 0 wait time', () => {
    expect(estimateWait(1, 1)).toBe(0);
  });
  test('position 2 waits one slot = expectedDuration', () => {
    expect(estimateWait(1, 2)).toBe(15);
  });
  test('position 3 waits two slots', () => {
    expect(estimateWait(1, 3)).toBe(30);
  });
  test('returns 0 for unknown service', () => {
    expect(estimateWait(999, 1)).toBe(0);
  });
  test('recalcWaitTimes reassigns positions after removal', () => {
    const queue = store.getQueue().filter(e => !(e.serviceId === 1 && e.position === 1));
    store.setQueue(queue);
    recalcWaitTimes(1);
    const remaining = store.getQueue().find(e => e.serviceId === 1);
    expect(remaining.position).toBe(1);
    expect(remaining.estimatedWait).toBe(0);
  });
});

describe('POST /api/auth/register', () => {
  test('rejects missing password', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'x' });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'alex' });
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/services', () => {
  test('returns all services', async () => {
    const res = await request(app).get('/api/services');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(4);
  });
  test('returns single service by id', async () => {
    const res = await request(app).get('/api/services/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Academic Advising');
  });
  test('returns 404 for unknown service', async () => {
    const res = await request(app).get('/api/services/999');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/services', () => {
  const valid = { name: 'New Service', description: 'Desc', expectedDuration: 10, priority: 'low' };
  test('creates a service successfully', async () => {
    const res = await request(app).post('/api/services').send(valid);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('New Service');
  });
  test('rejects missing name', async () => {
    const res = await request(app).post('/api/services').send({ ...valid, name: undefined });
    expect(res.statusCode).toBe(400);
  });
  test('rejects invalid priority', async () => {
    const res = await request(app).post('/api/services').send({ ...valid, priority: 'extreme' });
    expect(res.statusCode).toBe(400);
  });
  test('rejects non-numeric duration', async () => {
    const res = await request(app).post('/api/services').send({ ...valid, expectedDuration: 'fast' });
    expect(res.statusCode).toBe(400);
  });
});

describe('PUT /api/services/:id', () => {
  const update = { name: 'Updated', description: 'New desc', expectedDuration: 20, priority: 'high' };
  test('updates an existing service', async () => {
    const res = await request(app).put('/api/services/1').send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated');
  });
  test('returns 404 for unknown service', async () => {
    const res = await request(app).put('/api/services/999').send(update);
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/queue', () => {
  test('returns full queue', async () => {
    const res = await request(app).get('/api/queue');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
  test('filters queue by serviceId', async () => {
    const res = await request(app).get('/api/queue/service/1');
    expect(res.statusCode).toBe(200);
    res.body.forEach(e => expect(e.serviceId).toBe(1));
  });
  test('finds user in queue', async () => {
    const res = await request(app).get('/api/queue/user/Blake');
    expect(res.statusCode).toBe(200);
    expect(res.body.userName).toBe('Blake');
  });
  test('returns 404 for user not in queue', async () => {
    const res = await request(app).get('/api/queue/user/Nobody');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/queue/join', () => {
  test('user joins queue successfully', async () => {
    const res = await request(app).post('/api/queue/join').send({ serviceId: 1, userName: 'Dana' });
    expect(res.statusCode).toBe(201);
    expect(res.body.userName).toBe('Dana');
    expect(res.body.position).toBe(3);
  });
  test('calculates estimatedWait correctly', async () => {
    const res = await request(app).post('/api/queue/join').send({ serviceId: 1, userName: 'Dana' });
    expect(res.body.estimatedWait).toBe(30);
  });
  test('rejects joining inactive service', async () => {
    const res = await request(app).post('/api/queue/join').send({ serviceId: 4, userName: 'Dana' });
    expect(res.statusCode).toBe(400);
  });
  test('rejects duplicate join', async () => {
    const res = await request(app).post('/api/queue/join').send({ serviceId: 1, userName: 'Alex' });
    expect(res.statusCode).toBe(409);
  });
  test('rejects missing userName', async () => {
    const res = await request(app).post('/api/queue/join').send({ serviceId: 1 });
    expect(res.statusCode).toBe(400);
  });
  test('rejects unknown serviceId', async () => {
    const res = await request(app).post('/api/queue/join').send({ serviceId: 999, userName: 'Dana' });
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/queue/leave', () => {
  test('user leaves queue successfully', async () => {
    const res = await request(app).delete('/api/queue/leave').send({ serviceId: 1, userName: 'Alex' });
    expect(res.statusCode).toBe(200);
  });
  test('recalculates positions after leave', async () => {
    await request(app).delete('/api/queue/leave').send({ serviceId: 1, userName: 'Alex' });
    const res = await request(app).get('/api/queue/service/1');
    const first = res.body.find(e => e.userName === 'Blake');
    expect(first.position).toBe(1);
    expect(first.estimatedWait).toBe(0);
  });
  test('returns 404 if user not in queue', async () => {
    const res = await request(app).delete('/api/queue/leave').send({ serviceId: 1, userName: 'Nobody' });
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/queue/serve-next/:serviceId', () => {
  test('admin serves next user', async () => {
    const res = await request(app).post('/api/queue/serve-next/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.entry.userName).toBe('Alex');
  });
  test('recalculates positions after serve', async () => {
    await request(app).post('/api/queue/serve-next/1');
    const res = await request(app).get('/api/queue/service/1');
    expect(res.body[0].position).toBe(1);
    expect(res.body[0].estimatedWait).toBe(0);
  });
  test('returns 404 when queue is empty', async () => {
    await request(app).post('/api/queue/serve-next/1');
    await request(app).post('/api/queue/serve-next/1');
    const res = await request(app).post('/api/queue/serve-next/1');
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/history', () => {
  test('returns all history', async () => {
    const res = await request(app).get('/api/history');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
  test('filters history by userName', async () => {
    const res = await request(app).get('/api/history/user/Alex');
    expect(res.statusCode).toBe(200);
    res.body.forEach(h => expect(h.userName).toBe('Alex'));
  });
  test('returns empty array for unknown user', async () => {
    const res = await request(app).get('/api/history/user/Nobody');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('Notifications', () => {
  test('join queue triggers a notification', async () => {
    await request(app).post('/api/queue/join').send({ serviceId: 1, userName: 'Dana' });
    const res = await request(app).get('/api/history/notifications/Dana');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].message).toMatch(/joined/i);
  });
});