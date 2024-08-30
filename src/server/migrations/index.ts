import mysql from 'mysql';

import 'dotenv/config';
import createPostsTable from '@/server/migrations/create_posts_table';
import createUsersTable from '@/server/migrations/create_users_table';

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

connection.connect(err => {
  if (err) return;
  createUsersTable();
  createPostsTable();
  connection.end();
});

export default connection;
