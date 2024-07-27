"use strict";

// TODO:
//
// 0) Extract (global, shared!) state module
//    AND TEST THAT IT WORKS, MANUALLY!
//    Make sure to *docunent* each global var!
//
// 1) Import functions resulting from refactor
//    eg client-socket.js (including 'window' fn), sendMessage...
//
// 2) Consider how to create a test/development 'harness'
//    by (after first verifying that everything still works,
//    and uploading the *latest* client code to Github noting
//    that this is linked to my work at HA and care is needed!
//    How to automate verification of correct behaviour to make
//    slow, incremental development easier?
//
// Could start by documeting (in index.html) features available 
//
// REFACTOR SINGLE METHOD THEN MANUALLY-RETEST!
//
// Make the room ID an input first for convenience
//
// Consider diffing 'copscrypt' between here and laptop
// to make sure nothing is missing?
//
// Say that after refactoring we have modules for:
// - socket(/in, out)
// - data/(audiovideo, location, tm) - 'pre-socket'
// - data/tc - 'post-socket', really just anything from 'backend';
//   is it too unrealistic to hope that 
// - data/peer - 'post-socket', text/photo from connected peers
//
// Regarding the 'test/dev harness' if we do it functionally
// then we can at minimum:
// * assert that a particular method/property was called
// * assert that the method was called using given params
//
// "WizardWebRTC"
//
// SPECIFICATION:
// - handle constant-bitrate streams: audio(video)
// - handle variable-bitrate streams: (HD) video
// - handle event data: 'commands', peer msgs, GPS pings, txt...
//
// Interface to output (canvas, video elements etc):
// aim for idiosyncratic as needed but predicatble
//
// INCOMING
// * from peers: text, photo, location, notifications...
// * from server: text, ???, notifications...
//
// OUTGOING
// * audio/video
// * stills from camera(s)
// * chunks of audio, video
// * location (intermittent?)
//
// Does each correspond to a webRTC 'channel'?
//
// TO REITERATE

// A) Test current state
// B) Verify photo/gps share
// C) Extract one critical function into a module
//    (even just loading it as a 'before script' in index?)
// D) Retest
// E) When it doesn't work then rollback/figure out
// F) Otherwise, extract ONE (1) more critical function
// G) Retest

// Evaluate how you feel

// Would it make sense to extract+document the (global) st8 first?

// Would it make sense to define interfaces for the new functions 1st?

// How is this (best) testable?

// Could we alternatively make a little abstracted real/mock dep,
// start testing from this point of view?


/****************************************************************************
 * Initial setup
 ****************************************************************************/

// var configuration = {
//   'iceServers': [{
//     'urls': 'stun:stun.l.google.com:19302'
//   }]
// };

var configuration = {};

var clientGPS = {};

// var roomURL = document.getElementById('url');

var video = document.querySelector("video#camera");
var incomingVideo = document.querySelector("video#incoming");

var photo = document.getElementById("photo"); // TODO: Remove!

var photoContext = photo.getContext("2d");
var trailIncoming = document.getElementById("trailPeer");
var trailOutgoing = document.getElementById("trailUser");

var streamBtn = document.getElementById("stream-btn");

var photoContextW;
var photoContextH;

// Attach event handlers
streamBtn.addEventListener("click", createStream); // TODO: Disable while recieving!

// Create a random room if not already present in the URL.
var isInitiator;
var room = window.location.hash.substring(1);

if (room) {
  console.log("Room (hash):", room);
  document.title = `Express: ${room} [RECIEVER]`  
}

/****************************************************************************
 * Signaling server
 ****************************************************************************/

// Connect to the signaling server
var socket = io.connect();

socket.on("ipaddr", function (ipaddr) {
  console.log("Server IP address is: " + ipaddr);
  // updateRoomURL(ipaddr);
});

socket.on("created", function (room, clientId) {
  console.log("Created room", room, "- my client ID is", clientId);
  isInitiator = true;

  // setInterval(function() {
  //   shareLocation();
  // }, 20 * 1000); // every 20 seconds

  grabWebCamVideo();
});

socket.on("joined", function (room, clientId) {
  console.log("This peer has joined room", room, "with client ID:", clientId);
  isInitiator = false;
  createPeerConnection(isInitiator, configuration, clientId);
  // grabWebCamVideo();
});

socket.on("full", function (room) {
  alert("Room " + room + " is full. We will create a new room for you.");
  window.location.hash = "";
  window.location.reload();
});

socket.on("ready", function () {
  console.log("Socket is ready");
  
  if (isInitiator) {
    createPeerConnection(isInitiator, configuration, 0);
  }
});

socket.on("log", function (array) {
  console.log.apply(console, array);
});

socket.on("message", function (message) {
  console.log("Client received message:", message);

  if (message && message.type !== undefined) {
    signalingMessageCallback(message);
  } else {
    console.warn("Unexpected message:", message)
  }
});

// Joining a room.
// socket.emit("createOrJoin", room);
if (!room) {
  room = window.location.hash = randomToken();
  socket.emit("create", room);
} else socket.emit("join", room);

if (location.hostname.match(/localhost|127\.0\.0/)) {
  socket.emit("ipaddr");
}

// Leaving rooms and disconnecting from peers.
socket.on("disconnect", function (reason) {
  console.log(`Disconnected: ${reason}.`);
  // sendBtn.disabled = true;
  // snapAndSendBtn.disabled = true;
});

socket.on("bye", function (room) {
  console.log(`Peer leaving room:`, room);
  // sendBtn.disabled = true;
  // snapAndSendBtn.disabled = true;
  // If peer did not create the room, re-enter to be creator.
  if (!isInitiator) {
    window.location.reload();
  }
});

window.addEventListener("unload", function () {
  console.log(`Unloading window. Notifying peers in ${room}.`);
  socket.emit("bye", room);
});

/**
 * Send message to signaling server
 */
function sendMessage(message) {
  console.log("Client sending message: ", message);
  socket.emit("message", message);
}

/**
 * Updates URL on the page so that users can copy&paste it to their peers.
 */
// function updateRoomURL(ipaddr) {
//   var url;
//   if (!ipaddr) {
//     url = location.href;
//   } else {
//     url = location.protocol + '//' + ipaddr + ':2013/#' + room;
//   }
//   roomURL.innerHTML = url;
// }

/****************************************************************************
 * User media (webcam)
 ****************************************************************************/

function grabWebCamVideo() {
  console.log("Getting user media (video) ...");
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .then(gotStream)
    .catch(function (e) {
      alert("getUserMedia() error: " + e.name);
    });
}

function gotStream(stream) {
  console.log("getUserMedia video stream URL:", stream);
  window.stream = stream; // stream available to console
  video.srcObject = stream;
  video.onloadedmetadata = function () {
    photo.width = photoContextW = video.videoWidth;
    photo.height = photoContextH = video.videoHeight;
    console.log(
      "gotStream with width and height:",
      photoContextW,
      photoContextH,
    );
  };
  // show(snapBtn);
}

/****************************************************************************
 * WebRTC peer connection and data channel
 ****************************************************************************/

// Stream audio and video between users;
// note that RTCDataChannel is for data
var peerConn;

// TODO: Make into video!
var photoChannel;

var gpsChannel;

// SDP: Session Description Protocol
function signalingMessageCallback(message) {
  if (message.type === "offer") {
    console.log("Got offer. Sending answer to peer.");
    peerConn.setRemoteDescription(
      new RTCSessionDescription(message),
      function () {},
      logError,
    );
    peerConn.createAnswer(onLocalSessionCreated, logError);

  } else if (message.type === "answer") {
    console.log("Got answer.");
    peerConn.setRemoteDescription(
      new RTCSessionDescription(message),
      function () {},
      logError,
    );

  } else if (message.type === "candidate") {
    console.log("Adding ICE candidate:", message);
    peerConn.addIceCandidate(
      new RTCIceCandidate({
        candidate: message.candidate,
        sdpMLineIndex: message.label,
        sdpMid: message.id,
      }),
    );
  }
}

function createPeerConnection(isInitiator, config) {
  console.log(
    "Creating Peer connection as initiator?",
    isInitiator,
    "config:",
    config,
  );
  peerConn = new RTCPeerConnection(config);

  // Send any ICE candidates to the other peer
  peerConn.onicecandidate = function (event) {
    console.log("icecandidate event:", event);
    if (event.candidate) {
      sendMessage({
        type: "candidate",
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      });
    } else {
      console.log("End of candidates.");
    }
  };

  if (isInitiator) {
    gpsChannel = peerConn.createDataChannel("gps");
    onLocationDataChannelCreated();

    // Add tracks from stream to peer connection
    window.stream.getTracks().forEach(track => {
      console.log("Adding track to stream:", track, stream)
      peerConn.addTrack(track, window.stream)
    });

    console.log("Creating an offer");
    peerConn
      .createOffer()
      .then(function (offer) {
        return peerConn.setLocalDescription(offer);
      })
      .then(() => {
        console.log("sending local desc:", peerConn.localDescription);
        sendMessage(peerConn.localDescription);
      })
      .catch(logError);

  } else {
    peerConn.ondatachannel = function (event) {
      console.log("ondatachannel:", event.channel);
      if (event.channel.label == "photos") {
        photoChannel = event.channel;
        onPhotoDataChannelCreated();
      } else if (event.channel.label == "gps") {
        gpsChannel = event.channel;
        onLocationDataChannelCreated();
      }
    };

    console.log("set the 'track' event callback")
    peerConn.ontrack = function (event) {
      console.log("ontrack:", event);
      if (incomingVideo.srcObject !== event.streams[0]) {
        incomingVideo.srcObject = event.streams[0]
        console.log("recieved and set remote stream")
      }
    }

    peerConn.onnegotiationneeded = function (event) {
      console.log("onnegotiationneeded:", event);
    }
  }

  // TODO:
  //   If initiator then call getTracks() on localStream then add tracks to peerConn;
  //   else set peerConn.ontrack callback to set video.srcObject
}

function onLocalSessionCreated(desc) {
  console.log("local session created:", desc);
  peerConn
    .setLocalDescription(desc)
    .then(function () {
      console.log("sending local desc:", peerConn.localDescription);
      sendMessage(peerConn.localDescription);
    })
    .catch(logError);
}

function onPhotoDataChannelCreated() {
  photoChannel.onopen = function () {
    console.log("Photo data channel opened!");
    // sendBtn.disabled = false;
    // snapAndSendBtn.disabled = false;
  };

  photoChannel.onclose = function () {
    console.log("Photo data channel closed!");
    // sendBtn.disabled = true;
    // snapAndSendBtn.disabled = true;
  };

  photoChannel.onmessage = // FIXME: Adapt to update sharing location!
    adapter.browserDetails.browser === "firefox"
      ? receivePhotoDataFirefoxFactory()
      : receivePhotoDataChromeFactory();
}

function onLocationDataChannelCreated() {
  gpsChannel.onopen = function () {
    console.log("Location data channel opened!");
  };

  if (adapter.browserDetails.browser === "firefox")
    throw new Error("Need chrome!");
  gpsChannel.onmessage = receiveLocationDataChromeFactory();
}

function receivePhotoDataChromeFactory() {
  var buf, count;

  return function onmessage(event) {
    console.debug({ onMessage: event });

    if (typeof event.data === "string") {
      buf = window.buf = new Uint8ClampedArray(parseInt(event.data));
      count = 0;
      console.log("Expecting a total of " + buf.byteLength + " bytes");
      return;
    }

    var data = new Uint8ClampedArray(event.data);
    buf.set(data, count);

    count += data.byteLength;
    console.log("count: " + count);

    if (count === buf.byteLength) {
      // we're done: all data chunks have been received
      console.log("Done. Rendering photo.");
      renderPhoto(buf, trailIncoming);
    }
  };
}

function receiveLocationDataChromeFactory() {
  return function onmessage(event) {
    // Handle GPS coordinates
    // if (event.data.type === "gps") {
    console.debug("Received location of some client:", event);
    const longCommaLat = event.data;
    const long = Number.parseFloat(longCommaLat.split(",")[1]);
    const lat = Number.parseFloat(longCommaLat.split(",")[0]);
    console.debug(`Got long=${long}, lat=${lat}`);

    // { name: "Amsterdam", long: 52.37403, lat: 4.88969 },
    const newClient = {
      name: "Peer", // FIXME!
      long,
      lat,
    };
    incomingMessages = [...incomingMessages, newClient];
    // }
  };
}

// TODO!
function receivePhotoDataFirefoxFactory() {
  var count, total, parts;

  return function onmessage(event) {
    if (typeof event.data === "string") {
      total = parseInt(event.data);
      parts = [];
      count = 0;
      console.log("Expecting a total of " + total + " bytes");
      return;
    }

    parts.push(event.data);
    count += event.data.size;
    console.log(
      "Got " + event.data.size + " byte(s), " + (total - count) + " to go.",
    );

    if (count === total) {
      console.log("Assembling payload");
      var buf = new Uint8ClampedArray(total);
      var compose = function (i, pos) {
        var reader = new FileReader();
        reader.onload = function () {
          buf.set(new Uint8ClampedArray(this.result), pos);
          if (i + 1 === parts.length) {
            console.log("Done. Rendering photo.");
            renderPhoto(buf, trailIncoming);
          } else {
            compose(i + 1, pos + this.result.byteLength);
          }
        };
        reader.readAsArrayBuffer(parts[i]);
      };
      compose(0, 0);
    }
  };
}

/****************************************************************************
 * Aux functions, mostly UI-related
 ****************************************************************************/

/** Open the video+audio+location stream from one user in the room to others */
  function createStream() {
    // TODO: Move!
    // setInterval(function() {
    //   shareLocation();
    // }, 20 * 1000); // every 20 seconds
    
    // grabWebCamVideo();

    // Add tracks from stream to peer connection
    window.stream.getTracks().forEach(track => {
      console.log("Adding track to stream:", track, stream)
      peerConn.addTrack(track, window.stream)
    });
  }

// snapPhoto
function shareLocation() {
  // photoContext.drawImage(video, 0, 0, photo.width, photo.height);
  // show(photo, sendBtn);
  navigator.geolocation.getCurrentPosition(
    function (l) {
      clientGPS = {
        longitude: l.coords.longitude,
        latitude: l.coords.latitude,
      };
      if (gpsChannel) {
        console.debug(`Sending photo from location::`, clientGPS);
        gpsChannel.send(`${clientGPS.longitude},${clientGPS.latitude}`);
      }
    },
    function (e) {
      console.error(`Unable to get device location so using mock`, e);
      const mockGPS = {
        longitude: 166,
        latitude: -77,
      };
      if (gpsChannel) {
        gpsChannel.send(`${mockGPS.longitude},${mockGPS.latitude}`);
      }
    },
  );
}

// TODO: Remove
function sendPhoto() {
  // Split data channel message in chunks of this byte length.
  var CHUNK_LEN = 64000;
  console.log("width and height ", photoContextW, photoContextH);
  var img = photoContext.getImageData(0, 0, photoContextW, photoContextH),
    len = img.data.byteLength,
    n = (len / CHUNK_LEN) | 0;
  renderPhoto(img.data, trailOutgoing);

  console.log("Sending a total of " + len + " byte(s)");

  if (!photoChannel) {
    logError(
      "Connection has not been initiated. " +
        "Get two peers in the same room first",
    );
    return;
  } else if (photoChannel.readyState === "closed") {
    logError("Connection was lost. Peer closed the connection.");
    return;
  }

  if (!gpsChannel) {
    logError(`Can't send location data because there isn't a channel!`);
  } else {
    // FIXME: Send GPS here instead?
    console.debug(`Sending client GPS:`, clientGPS);
    // gpsChannel.send(clientGPS);
  }

  photoChannel.send(len);

  // split the photo and send in chunks of about 64KB
  for (var i = 0; i < n; i++) {
    var start = i * CHUNK_LEN,
      end = (i + 1) * CHUNK_LEN;
    console.log(start + " - " + (end - 1));
    photoChannel.send(img.data.subarray(start, end));
  }

  // send the reminder, if any
  if (len % CHUNK_LEN) {
    console.log("last " + (len % CHUNK_LEN) + " byte(s)");
    photoChannel.send(img.data.subarray(n * CHUNK_LEN));
  }
}

function snapAndSend() {
  shareLocation();
  sendPhoto();
}

function renderPhoto(data, trail) {
  var canvas = document.createElement("canvas");
  canvas.width = photoContextW;
  canvas.height = photoContextH;
  canvas.classList.add("incomingPhoto");
  // trail is the element holding the incoming images
  trail.insertBefore(canvas, trail.firstChild);

  var context = canvas.getContext("2d");
  var img = context.createImageData(photoContextW, photoContextH);
  img.data.set(data);
  context.putImageData(img, 0, 0);
}

function show() {
  Array.prototype.forEach.call(arguments, function (elem) {
    elem.style.display = null;
  });
}

function hide() {
  Array.prototype.forEach.call(arguments, function (elem) {
    elem.style.display = "none";
  });
}

function randomToken() {
  return Math.floor((1 + Math.random()) * 1e16)
    .toString(16)
    .substring(1);
}

function logError(err) {
  if (!err) return;
  if (typeof err === "string") {
    console.warn(err);
  } else {
    console.warn(err.toString(), err);
  }
}
1;
