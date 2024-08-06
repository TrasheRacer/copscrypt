function createStream(socket, streamId) {
    socket.emit("create_stream", streamId)
}

function joinStream(socket, streamId) {
    socket.emit("join_stream", streamId)
}
