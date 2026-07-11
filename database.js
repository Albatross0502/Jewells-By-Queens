const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite DB (creates file if it doesn't exist)
const dbPath = path.join(__dirname, 'jewells.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            img TEXT NOT NULL
        )`);
    }
});

module.exports = db;