"use strict";

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
            socket.emit("stream_created", socket.id)
        } else {
            warn(`client ${socket.id} can't create existing stream ${streamId}`);
            debug(`stream ${streamId} already has ${clientCount} clients`);
        }
    })

    socket.on("join_stream", (streamId) => {
        log(`client ${socket.id} trying to join stream ${streamId}`);
        const stream = io.sockets.adapter.rooms.get(streamId);
        debug(`stream ${streamId} clients`, stream)
        const clientCount = (stream ?? new Set()).size
        if (clientCount > 0) {
            socket.join(streamId)
            log(`client ${socket.id} successfully joined stream ${streamId}`);
            socket.broadcast.emit("stream_joined", socket.id)
            socket.emit("stream_joined", socket.id) // also send to self
        } else {
            warn(`client ${socket.id} can't join nonexistent stream ${streamId}`);
        }
    })

    socket.on("share_candidate", (candidate) => {
        // debug(`sharing candidate`, candidate)
        debug(`sharing candidate...`)
        socket.broadcast.emit("share_candidate", candidate)
    })

    socket.on("share_offer", (offer) => {
        debug(`sharing offer`, offer)
        socket.broadcast.emit("share_offer", offer)
    })

    socket.on("share_answer", (answer) => {
        debug(`sharing answer`, answer)
        socket.broadcast.emit("share_answer", answer)
    })
}

export { createSignalling }