const db = require('./db');

function getAllHistory() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM notifications ORDER BY created_at DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getHistoryByUser(userName) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM notifications WHERE userName = ? ORDER BY created_at DESC',
      [userName],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

function addHistoryEntry({ userName, message, role = 'user' }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO notifications (userName, role, message, status) VALUES (?, ?, ?, "sent")',
      [userName, role, message],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, userName, role, message, status: 'sent' });
      }
    );
  });
}

function markAsViewed(id) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE notifications SET status = "viewed" WHERE id = ?',
      [id],
      function (err) {
        if (err) reject(err);
        else resolve({ updated: this.changes });
      }
    );
  });
}

module.exports = { getAllHistory, getHistoryByUser, addHistoryEntry, markAsViewed };