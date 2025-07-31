// live mysql

const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'yamabiko.proxy.rlwy.net',
    port: 27506,
    user: 'root',
    password: 'NpqhDleuuAjwiKfTJoZPBmpLwTNBFSeq',
    database: 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

console.warn('✅ Connected to Railway MySQL');
module.exports = db;





