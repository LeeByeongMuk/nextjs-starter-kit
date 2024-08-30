import connection from '@/server/migrations';

function createPostsTables() {
  const createPostsTable = `
    CREATE TABLE IF NOT EXISTS posts (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      type ENUM('free', 'notice', 'faq') NULL,
      title VARCHAR(100) NOT NULL,
      contents LONGTEXT NOT NULL,
      hit INT UNSIGNED DEFAULT 0,
      likes_count INT UNSIGNED DEFAULT 0,
      is_published BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  connection.query(createPostsTable, err => {
    if (err) throw err;
  });
}

export default function execute() {
  createPostsTables();
}
