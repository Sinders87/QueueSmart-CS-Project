const db = require('./db');


let services = [
  { id: 1, name: 'Academic Advising', description: 'Meet with an academic advisor to discuss degree planning', expectedDuration: 15, priority: 'medium', isActive: true },
  { id: 2, name: 'Financial Aid Assistance', description: 'Help with FAFSA and financial aid questions', expectedDuration: 20, priority: 'high', isActive: true },
  { id: 3, name: 'IT Help Desk', description: 'Technical support for university systems', expectedDuration: 10, priority: 'low', isActive: true },
  { id: 4, name: 'Registration Support', description: 'Assistance with course registration issues', expectedDuration: 12, priority: 'medium', isActive: false }
];
let queue = [
  { id: 101, serviceId: 1, userName: 'Alex', status: 'waiting', position: 1, estimatedWait: 0 },
  { id: 102, serviceId: 1, userName: 'Blake', status: 'waiting', position: 2, estimatedWait: 15 },
  { id: 201, serviceId: 2, userName: 'Casey', status: 'waiting', position: 1, estimatedWait: 0 }
];
let history = [
  { id: 1, serviceId: 1, serviceName: 'Academic Advising', date: '2026-02-10', outcome: 'served', userName: 'Alex' },
  { id: 2, serviceId: 2, serviceName: 'Financial Aid Assistance', date: '2026-02-05', outcome: 'left', userName: 'Casey' }
];
let notifications = [];
let users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'alex', password: 'user123', role: 'user' },
  { id: 3, username: 'blake', password: 'user123', role: 'user' }
];
let nextQueueId = 300, nextHistoryId = 3, nextServiceId = 5, nextUserId = 4;
module.exports = {
  getServices: () => services, getQueue: () => queue, getHistory: () => history,
  getNotifications: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM notifications ORDER BY datetime(created_at) DESC`,
        [],
        (err, rows) => {
          if (err) {
            return reject(err);
          }
          resolve(rows);
        }
      );
    });
  },
  getUsers: () => users,
  setServices: (s) => { services = s; }, setQueue: (q) => { queue = q; }, setHistory: (h) => { history = h; },
  nextQueueId: () => nextQueueId++, nextHistoryId: () => nextHistoryId++,
  nextServiceId: () => nextServiceId++, nextUserId: () => nextUserId++,
  addNotification(message, userName, role = 'user', status = 'sent') {
    return new Promise((resolve, reject) => {
      const createdAt = new Date().toISOString();

      db.run(
        `INSERT INTO notifications (userName, role, message, status, created_at)
        VALUES (?, ?, ?, ?, ?)`,
        [userName, role, message, status, createdAt],
        function (err) {
          if (err) {
            return reject(err);
          }
          resolve({
            id: this.lastID,
            userName,
            role,
            message,
            status,
            created_at: createdAt
          });
        }
      );
    });
  },

  markAsViewed: (id) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE notifications
        SET status = 'viewed'
        WHERE id = ?`,
        [id],
        function (err) {
          if (err) {
            return reject(err);
          }
          resolve({ updated: this.changes });
        }
      );
    });
  },
  
  reset() {
    services = [
      { id: 1, name: 'Academic Advising', description: 'Meet with an academic advisor to discuss degree planning', expectedDuration: 15, priority: 'medium', isActive: true },
      { id: 2, name: 'Financial Aid Assistance', description: 'Help with FAFSA and financial aid questions', expectedDuration: 20, priority: 'high', isActive: true },
      { id: 3, name: 'IT Help Desk', description: 'Technical support for university systems', expectedDuration: 10, priority: 'low', isActive: true },
      { id: 4, name: 'Registration Support', description: 'Assistance with course registration issues', expectedDuration: 12, priority: 'medium', isActive: false }
    ];
    queue = [
      { id: 101, serviceId: 1, userName: 'Alex', status: 'waiting', position: 1, estimatedWait: 0 },
      { id: 102, serviceId: 1, userName: 'Blake', status: 'waiting', position: 2, estimatedWait: 15 },
      { id: 201, serviceId: 2, userName: 'Casey', status: 'waiting', position: 1, estimatedWait: 0 }
    ];
    history = [
      { id: 1, serviceId: 1, serviceName: 'Academic Advising', date: '2026-02-10', outcome: 'served', userName: 'Alex' },
      { id: 2, serviceId: 2, serviceName: 'Financial Aid Assistance', date: '2026-02-05', outcome: 'left', userName: 'Casey' }
    ];
    notifications = [];
    nextQueueId = 300; nextHistoryId = 3; nextServiceId = 5; nextUserId = 4;
  }
};