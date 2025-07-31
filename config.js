// local mysql

const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'projectmanagement',
    multipleStatements: true
});

 
console.warn('Connected');

module.exports = db;


// live server

// const mysql = require('mysql2/promise');

// const db = mysql.createPool({
//   host: 'ballast.proxy.rlwy.net',
//   port: 19598,
//   user: 'root',
//   password: 'wmnatvbnKaNnCTXDJZoyfrsErUboJPpk',
//   database: 'railway', // Replace with actual DB name if different
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// console.warn('✅ Connected to Railway MySQL');
// module.exports = db;



