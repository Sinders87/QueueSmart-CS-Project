const db = require('./db');

function getAllServices() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM services', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(r => ({ ...r, isActive: r.isActive === 1 })));
    });
  });
}

function getServiceById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM services WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row ? { ...row, isActive: row.isActive === 1 } : null);
    });
  });
}

function createService({ name, description, expectedDuration, priority, isActive = true }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO services (name, description, expectedDuration, priority, isActive) VALUES (?, ?, ?, ?, ?)',
      [name, description, expectedDuration, priority, isActive ? 1 : 0],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, description, expectedDuration, priority, isActive });
      }
    );
  });
}

function updateService(id, { name, description, expectedDuration, priority, isActive }) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE services SET name=?, description=?, expectedDuration=?, priority=?, isActive=? WHERE id=?',
      [name, description, expectedDuration, priority, isActive ? 1 : 0, id],
      function (err) {
        if (err) reject(err);
        else resolve({ id, name, description, expectedDuration, priority, isActive });
      }
    );
  });
}

module.exports = { getAllServices, getServiceById, createService, updateService };