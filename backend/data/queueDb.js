const db = require('./db');

function getQueue() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM queue_entries WHERE status = "waiting" ORDER BY position ASC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getQueueByService(serviceId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM queue_entries WHERE serviceId = ? AND status = "waiting" ORDER BY position ASC',
      [serviceId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

function getQueueEntryByUser(userName) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM queue_entries WHERE userName = ? AND status = "waiting"',
      [userName],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
}

function joinQueue({ serviceId, userName, position, estimatedWait }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO queue_entries (serviceId, userName, status, position, estimateWait) VALUES (?, ?, "waiting", ?, ?)',
      [serviceId, userName, position, estimatedWait],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, serviceId, userName, status: 'waiting', position, estimatedWait });
      }
    );
  });
}

function leaveQueue(serviceId, userName) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE queue_entries SET status = "canceled" WHERE serviceId = ? AND userName = ? AND status = "waiting"',
      [serviceId, userName],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

function serveNext(serviceId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM queue_entries WHERE serviceId = ? AND status = "waiting" ORDER BY position ASC LIMIT 1',
      [serviceId],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        db.run(
          'UPDATE queue_entries SET status = "served" WHERE id = ?',
          [row.id],
          function (err2) {
            if (err2) reject(err2);
            else resolve(row);
          }
        );
      }
    );
  });
}

function recalcPositions(serviceId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM queue_entries WHERE serviceId = ? AND status = "waiting" ORDER BY position ASC',
      [serviceId],
      (err, rows) => {
        if (err) return reject(err);
        const updates = rows.map((row, idx) =>
          new Promise((res, rej) => {
            db.run(
              'UPDATE queue_entries SET position = ? WHERE id = ?',
              [idx + 1, row.id],
              (e) => e ? rej(e) : res()
            );
          })
        );
        Promise.all(updates).then(resolve).catch(reject);
      }
    );
  });
}

module.exports = { getQueue, getQueueByService, getQueueEntryByUser, joinQueue, leaveQueue, serveNext, recalcPositions };const db = require('./db');

function getQueue() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM queue_entries WHERE status = "waiting" ORDER BY position ASC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getQueueByService(serviceId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM queue_entries WHERE serviceId = ? AND status = "waiting" ORDER BY position ASC',
      [serviceId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

function getQueueEntryByUser(userName) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM queue_entries WHERE userName = ? AND status = "waiting"',
      [userName],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
}

function joinQueue({ serviceId, userName, position, estimatedWait }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO queue_entries (serviceId, userName, status, position, estimateWait) VALUES (?, ?, "waiting", ?, ?)',
      [serviceId, userName, position, estimatedWait],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, serviceId, userName, status: 'waiting', position, estimatedWait });
      }
    );
  });
}

function leaveQueue(serviceId, userName) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE queue_entries SET status = "canceled" WHERE serviceId = ? AND userName = ? AND status = "waiting"',
      [serviceId, userName],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

function serveNext(serviceId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM queue_entries WHERE serviceId = ? AND status = "waiting" ORDER BY position ASC LIMIT 1',
      [serviceId],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        db.run(
          'UPDATE queue_entries SET status = "served" WHERE id = ?',
          [row.id],
          function (err2) {
            if (err2) reject(err2);
            else resolve(row);
          }
        );
      }
    );
  });
}

function recalcPositions(serviceId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM queue_entries WHERE serviceId = ? AND status = "waiting" ORDER BY position ASC',
      [serviceId],
      (err, rows) => {
        if (err) return reject(err);
        const updates = rows.map((row, idx) =>
          new Promise((res, rej) => {
            db.run(
              'UPDATE queue_entries SET position = ? WHERE id = ?',
              [idx + 1, row.id],
              (e) => e ? rej(e) : res()
            );
          })
        );
        Promise.all(updates).then(resolve).catch(reject);
      }
    );
  });
}

module.exports = { getQueue, getQueueByService, getQueueEntryByUser, joinQueue, leaveQueue, serveNext, recalcPositions };const db = require('./db');

function getQueue() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM queue_entries WHERE status = "waiting" ORDER BY position ASC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getQueueByService(serviceId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM queue_entries WHERE serviceId = ? AND status = "waiting" ORDER BY position ASC',
      [serviceId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

function getQueueEntryByUser(userName) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM queue_entries WHERE userName = ? AND status = "waiting"',
      [userName],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
}

function joinQueue({ serviceId, userName, position, estimatedWait }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO queue_entries (serviceId, userName, status, position, estimateWait) VALUES (?, ?, "waiting", ?, ?)',
      [serviceId, userName, position, estimatedWait],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, serviceId, userName, status: 'waiting', position, estimatedWait });
      }
    );
  });
}

function leaveQueue(serviceId, userName) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE queue_entries SET status = "canceled" WHERE serviceId = ? AND userName = ? AND status = "waiting"',
      [serviceId, userName],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

function serveNext(serviceId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM queue_entries WHERE serviceId = ? AND status = "waiting" ORDER BY position ASC LIMIT 1',
      [serviceId],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        db.run(
          'UPDATE queue_entries SET status = "served" WHERE id = ?',
          [row.id],
          function (err2) {
            if (err2) reject(err2);
            else resolve(row);
          }
        );
      }
    );
  });
}

function recalcPositions(serviceId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM queue_entries WHERE serviceId = ? AND status = "waiting" ORDER BY position ASC',
      [serviceId],
      (err, rows) => {
        if (err) return reject(err);
        const updates = rows.map((row, idx) =>
          new Promise((res, rej) => {
            db.run(
              'UPDATE queue_entries SET position = ? WHERE id = ?',
              [idx + 1, row.id],
              (e) => e ? rej(e) : res()
            );
          })
        );
        Promise.all(updates).then(resolve).catch(reject);
      }
    );
  });
}

module.exports = { getQueue, getQueueByService, getQueueEntryByUser, joinQueue, leaveQueue, serveNext, recalcPositions };