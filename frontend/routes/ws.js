var os = require("os");

function createWS(io) {
  io.sockets.on("connection", function (socket) {
    log("Client connected:", socket.id);
    // socket.emit(`Number of rooms:`, io.sockets.adapter.rooms.length)

    // convenience function to log server messages on the client
    function log() {
      var array = ["Message from server:"];
      array.push.apply(array, arguments);
      console.debug(array.join(" "));
      socket.emit("log", array);
    }

    socket.on("message", function (message) {
      console.debug("Client said: ", message);
      // for a real app, would be room-only (not broadcast)
      socket.broadcast.emit("message", message);
    });

    socket.on("createOrJoin", function (room) {
      log(
        `Received request from client ${socket.id} to create or join room:`,
        room,
      );
      console.debug(`All rooms:`, io.sockets.adapter.rooms);
      var clientsInRoom = io.sockets.adapter.rooms[room];
      var numClients = clientsInRoom
        ? Object.keys(clientsInRoom.sockets).length
        : 0;
      log("Room " + room + " now has " + numClients + " client(s)");

      if (numClients === 0) {
        socket.join(room);
        log("Client" + socket.id + " created room " + room);
        socket.emit("created", room, socket.id);
      } else if (numClients === 1) {
        log("Client" + socket.id + " joined room " + room);
        // io.sockets.in(room).emit('join', room);
        socket.join(room);
        socket.emit("joined", room, socket.id);
        io.sockets.in(room).emit("ready", room);
        socket.broadcast.emit("ready", room);
      } else {
        // max two clients
        socket.emit("full", room);
      }
    });

    socket.on("create", function (room) {
      log(`Received request from client ${socket.id} to create room:`, room);
      console.debug(`All rooms:`, io.sockets.adapter.rooms);
      var clientsInRoom = io.sockets.adapter.rooms[room];
      var numClients = clientsInRoom
        ? Object.keys(clientsInRoom.sockets).length
        : 0;
      log("Room " + room + " now has " + numClients + " client(s)");

      if (numClients === 0) {
        socket.join(room);
        log("Client" + socket.id + " created room " + room);
        socket.emit("created", room, socket.id);
      } else {
        // max two clients
        console.warn(`Room must be empty/nonexistent in order to create it!`);
        socket.emit("full", room);
      }
    });

    socket.on("join", function (room) {
      log(`Received request from client ${socket.id} to join room:`, room);
      console.debug(`All rooms:`, io.sockets.adapter.rooms);

      var clientsInRoom = io.sockets.adapter.rooms[room];
      var numClients = clientsInRoom
        ? Object.keys(clientsInRoom.sockets).length
        : 0;
      numClients = 1; // FIXME!
      // log("Room " + room + " now has " + numClients + " client(s)");

      if (numClients === 0) {
        console.warn(`Room must exist in order to join it!`);
        // socket.join(room);
        // log("Client" + socket.id + " created room " + room);
        // socket.emit("created", room, socket.id);
      } else if (numClients === 1) {
        log("Client" + socket.id + " joined room " + room);
        // io.sockets.in(room).emit('join', room);
        socket.join(room);
        socket.emit("joined", room, socket.id);
        io.sockets.in(room).emit("ready", room);
        socket.broadcast.emit("ready", room);
      } else {
        // max two clients
        socket.emit("full", room);
      }
    });

    socket.on("ipaddr", function () {
      log("got ipaddr...");

      var ifaces = os.networkInterfaces();
      for (var dev in ifaces) {
        ifaces[dev].forEach(function (details) {
          if (details.family === "IPv4" && details.address !== "127.0.0.1") {
            const addr = details.address;
            log("ipaddr:", addr);
            socket.emit("ipaddr", addr);
          }
        });
      }
    });

    socket.on("disconnect", function (reason) {
      console.log(`Peer or server disconnected; reason:`, reason);
      socket.broadcast.emit("bye");
    });

    socket.on("bye", function (room) {
      console.log(`Peer said bye on room:`, room);
    });
  });
}

module.exports = createWS;
