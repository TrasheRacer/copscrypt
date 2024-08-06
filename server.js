// public

import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

// private

import { log } from './server-log.mjs'

const app = express();
const server = createServer(app);

// initialise socket.io
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static('public'))

app.get('/', (req, res) => {
    log('requested index')
    res.sendFile(join(__dirname, 'index.html'));
});

app.get('/stream', (req, res) => {
    log('requested stream')
    res.sendFile(join(__dirname, 'index-stream.html'));
});

// event predefined by library
io.on('connection', (socket) => {
    log('a user connected');
  });

server.listen(3000, () => {
    log('server running at http://localhost:3000');
});