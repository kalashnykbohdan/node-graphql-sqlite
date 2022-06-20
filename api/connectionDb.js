const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(path.resolve(__dirname, '../db_base/commits.db'), sqlite3.OPEN_READWRITE, (err) => {
    if(err) return console.error(err.message);
    console.log("connection successful");
});

module.exports = db;