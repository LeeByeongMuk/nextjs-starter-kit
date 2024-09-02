import { SignUpReq } from '@/app/types/auth';
import connection from '@/server/migrations';

export default function Users() {}

Users.signIn = async function (req: SignUpReq) {
  const signIn = `
    SELECT * FROM users
    WHERE email = '${req.email}' AND password = '${req.password}'
  `;

  return new Promise((resolve, reject) => {
    connection.query(
      signIn,
      [req.email, req.password],
      (err, result) => {
        if (err) reject(err);
        resolve(result[0]);
      }
    );
  });
}

Users.createUser = async function (req: SignUpReq) {
  const createUser = `
    INSERT INTO users (name, nickname, email, password)
    VALUES ('${req.name}', '${req.nickname}', '${req.email}', '${req.password}')
  `;

  return new Promise((resolve, reject) => {
    connection.query(
      createUser,
      [req.name, req.nickname, req.email, req.password],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};
