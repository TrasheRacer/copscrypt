import { log, warn, debug } from './server-log.mjs'

function createSignalling(io, socket) {
    log(`client ${socket.id} has connected`);

    socket.on("create_stream", (streamId) => {
        log(`client ${socket.id} trying to create stream ${streamId}`);
        const stream = io.sockets.adapter.rooms.get(streamId);
        const clientCount = (stream ?? new Set()).size
        if (clientCount === 0) {
            socket.join(streamId)
            log(`client ${socket.id} successfully created stream ${streamId}`);
            debug(`stream ${streamId} clients`, io.sockets.adapter.rooms.get(streamId))
        } else {
            warn(`client ${socket.id} can't create existing stream ${streamId}`);
            debug(`stream ${streamId} already has ${clientCount} clients`);
        }
    })

    socket.on("join_stream", (streamId) => {
        log(`client ${socket.id} trying to join stream ${streamId}`);
        const stream = io.sockets.adapter.rooms.get(streamId);
        debug(`stream ${streamId} clients`, stream)
        const clientCount = stream.size
        if (clientCount > 0) {
            socket.join(streamId)
            log(`client ${socket.id} successfully joined stream ${streamId}`);
        } else {
            warn(`client ${socket.id} can't join nonexistent stream ${streamId}`);
        }
    })
}

export { createSignalling }