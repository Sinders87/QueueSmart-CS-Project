const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'queuesmart.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(`
        CREATE TABLE IF NOT EXISTS UserCredentials (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('user', 'admin'))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS UserProfile (
            profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            contact_info TEXT,
            preferences TEXT,
            FOREIGN KEY (user_id) REFERENCES UserCredentials(user_id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            expectedDuration INTEGER NOT NULL CHECK(expectedDuration > 0),
            priority TEXT NOT NULL,
            isActive INTEGER NOT NULL DEFAULT 1
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Queue (
            queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id INTEGER NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('open', 'closed')),
            created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS queue_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            queue_id INTEGER,
            serviceId INTEGER NOT NULL,
            user_id INTEGER,
            userName TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('waiting', 'served', 'canceled')),
            position INTEGER NOT NULL,
            estimateWait INTEGER NOT NULL,
            joinTime TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (queue_id) REFERENCES Queue(queue_id) ON DELETE CASCADE,
            FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES UserCredentials(user_id) ON DELETE SET NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            userName TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('sent', 'viewed')),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES UserCredentials(user_id) ON DELETE SET NULL
        )
    `);
});

module.exports = db;
