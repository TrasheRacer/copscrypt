"use strict";

// public
import express from 'express';
import { readFileSync } from 'fs'
import { createServer } from 'node:https';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

// private
import { log } from './server-log.mjs'
import { createSignalling } from './server-io.mjs'

// initialise
const app = express();
const credentials = {
    key: readFileSync("ssl/key.pem"),
    cert: readFileSync("ssl/cert.pem")
}
const server = createServer(credentials, app);
const io = new Server(server);

// routes
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static('public'))
app.get('/', (req, res) => {
    // log('requested index')
    res.sendFile(join(__dirname, 'index.html'));
});
app.get('/stream', (req, res) => {
    // log('requested stream')
    res.sendFile(join(__dirname, 'index-stream.html'));
});

// event predefined by library
io.on('connection', (socket) => createSignalling(io, socket));

// metrics
// setInterval(() => {
//     log(`connected sockets to stream id`, io.sockets.adapter.sids)
// }, 10000) // every ten seconds

// ready
server.listen(3000, () => {
    log('listening');
});