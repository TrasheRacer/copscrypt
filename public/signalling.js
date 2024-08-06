function createStream(socket, streamId) {
    socket.emit("create_stream", streamId)
}