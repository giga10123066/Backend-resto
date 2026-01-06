// src/database/knexfile.js
require('dotenv').config({ path: '../../.env' }); // Adjust path sesuai letak .env

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'mobile-resto-db',
      multipleStatements: true, // Penting untuk trigger
      timezone: 'UTC',
      dateStrings: true
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};