const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { estimateWait } = require('../utils/waitTime');

const dbPath = path.join(__dirname, 'queuesmart.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
    console.error('Error connecting to SQLite:', err.message);
    } 
    else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    
    db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userName TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        created_at TEXT NOT NULL)
        `);

    db.run(`
        CREATE TABLE IF NOT EXISTS queue_entries (
        id INTEGER PRIMARY KEY,
        serviceId INTEGER NOT NULL,
        userName TEXT NOT NULL,
        status TEXT NOT NULL,
        position INTEGER NOT NULL,
        estimateWait INTEGER NOT NULL,
        joinTime TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        expectedDuration INTEGER NOT NULL,
        priority TEXT NOT NULL,
        isActive INTEGER NOT NULL
        )
    `);

});

module.exports = db;