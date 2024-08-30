import connection from '@/server/migrations/index';

function createUsersTable() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      nickname VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NULL,
      password VARCHAR(200) NULL,
      provider VARCHAR(20) NULL,
      provider_id VARCHAR(200) NULL,
      provider_token VARCHAR(200) NULL,
      remember_token VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL,
      deleted_reason VARCHAR(200) NULL
    );
  `;

  connection.query(createUsersTable, err => {
    if (err) throw err;
  });
}

function createSessionsTable() {
  const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      user_id BIGINT UNSIGNED NULL,
      INDEX (user_id)
    );
  `;

  connection.query(createSessionsTable, err => {
    if (err) throw err;
  });
}

export default function execute() {
  createUsersTable();
  createSessionsTable();
}