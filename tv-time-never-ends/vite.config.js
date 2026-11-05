import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function localApiPlugin() {
  const dbPath = path.resolve(process.cwd(), 'db.json');

  function readDb() {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({ users: [], scores: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  }

  function writeDb(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  }

  function parseBody(req) {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch {
          resolve({});
        }
      });
    });
  }

  return {
    name: 'local-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/api/auth/register' && req.method === 'POST') {
          const { nickname, password } = await parseBody(req);
          if (!nickname || !password) {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: 'Введіть нікнейм та пароль' }));
            return;
          }

          const db = readDb();
          const exists = db.users.find(
            (u) => u.nickname.toLowerCase() === nickname.trim().toLowerCase()
          );

          if (exists) {
            res.statusCode = 409;
            res.end(JSON.stringify({ message: 'Цей нікнейм вже зайнятий!' }));
            return;
          }

          const newUser = {
            id: Date.now(),
            nickname: nickname.trim(),
            password,
          };

          db.users.push(newUser);
          writeDb(db);

          res.statusCode = 201;
          res.end(
            JSON.stringify({
              user: { id: newUser.id, nickname: newUser.nickname },
              token: `tv-token-${newUser.id}`,
            })
          );
          return;
        }

        if (req.url === '/api/auth/login' && req.method === 'POST') {
          const { nickname, password } = await parseBody(req);
          const db = readDb();
          const user = db.users.find(
            (u) =>
              u.nickname.toLowerCase() === (nickname || '').trim().toLowerCase() &&
              u.password === password
          );

          if (!user) {
            res.statusCode = 401;
            res.end(JSON.stringify({ message: 'Невірний нікнейм або пароль!' }));
            return;
          }

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              user: { id: user.id, nickname: user.nickname },
              token: `tv-token-${user.id}`,
            })
          );
          return;
        }

        if (req.url === '/api/auth/me' && req.method === 'GET') {
          const token = (req.headers.authorization || '').replace('Bearer ', '');
          const db = readDb();
          const user = db.users.find((u) => `tv-token-${u.id}` === token);

          if (!user) {
            res.statusCode = 401;
            res.end(JSON.stringify({ message: 'Сесія недійсна' }));
            return;
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ id: user.id, nickname: user.nickname }));
          return;
        }

        if (req.url === '/api/scores' && req.method === 'GET') {
          const db = readDb();
          const sorted = [...db.scores].sort((a, b) => b.score - a.score).slice(0, 10);
          res.statusCode = 200;
          res.end(JSON.stringify(sorted));
          return;
        }

        if (req.url === '/api/scores' && req.method === 'POST') {
          const { nickname, score } = await parseBody(req);
          const db = readDb();
          const entry = {
            id: Date.now(),
            nickname: nickname || 'GUEST',
            score: Number(score) || 0,
            date: new Date().toISOString().slice(0, 10),
          };
          db.scores.push(entry);
          writeDb(db);

          const sorted = [...db.scores].sort((a, b) => b.score - a.score).slice(0, 10);
          res.statusCode = 201;
          res.end(JSON.stringify(sorted));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  base: '/',
});
