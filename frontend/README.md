## Overview

* WebRTC signalling server over websocket
* Active clients displayed as points/trails on map

### WebRTC

The following are notes on the AppRTC example project
from Google code labs,
see https://github.com/webrtc/apprtc/ 
and https://codelabs.developers.google.com/codelabs/webrtc-web/
and https://web.dev/articles/webrtc-infrastructure
for more info

#### Signalling

Although we currently use various channels with socket.IO
we might do something like this instead:

```
var onMessageCallbacks = {};

socketio.on('message', function(data) {
    if(data.sender == currentUserUUID) return;

    if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
    };
});
```

#### Video streaming

See https://github.com/webrtc/samples/blob/gh-pages/src/content/peerconnection/pc1/js/main.js for more

**BASIC OVERVIEW?**

```
pc1 = new RTCPeerConnection(configuration);
// Do local ICE candidate, connection state change stuff

pc2 = new RTCPeerConnection(configuration);
// Do remove ICE candidate, connection state change stuff

pc2.addEventListener('track', gotRemoteStream);

// localStream comes from getUserMedia
localStream.getTracks().forEach(track => {
  pc1.addTrack(track, localStream)
});
```

See `client.js:360` for the point to add video;
first add a `<video>` element for the reciever

#### Download

Shouldn't be too hard to let the user save the video `srcObject` somehow?