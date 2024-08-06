import express from 'express';
import { createServer } from 'node:http';
import { log } from './server-log.mjs'

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(3000, () => {
  log('server running at http://localhost:3000');
});