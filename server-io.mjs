import { log, warn, debug } from './server-log.mjs'

function createSignalling(io, socket) {
    log(`client ${socket.id} has connected`);

    socket.on("create_stream", (streamId) => {
        log(`client ${socket.id} trying to create stream ${streamId}`);
        const clients = io.sockets.adapter.rooms[streamId];
        const clientCount = clients
          ? Object.keys(clientsInRoom.sockets).length
          : 0;
        if (clientCount === 0) {
            socket.join(streamId)
            log(`client ${socket.id} successfully created stream ${streamId}`);
        } else {
            warn(`client ${socket.id} can't create existing stream ${streamId}`);
            debug(`stream ${streamId} already has ${clientCount} clients`);
        }
    })
}

export { createSignalling }