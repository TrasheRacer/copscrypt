import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { log } from './server-log.mjs'

const app = express();
const server = createServer(app);

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

server.listen(3000, () => {
    log('server running at http://localhost:3000');
});