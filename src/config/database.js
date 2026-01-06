const mysql = require('mysql2');
require('dotenv').config();

// Buat pool koneksi (lebih efisien daripada koneksi tunggal)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ubah menjadi promise agar bisa pakai 'await'
const db = pool.promise();

console.log("Database connection pool created.");

module.exports = db;