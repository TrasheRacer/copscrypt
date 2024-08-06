"use strict";

// const iceConfig = {
//   'iceServers': [{
//     'urls': 'stun:stun.l.google.com:19302'
//   }]
// };
const iceConfig = {} // FIXME!

function createStream(socket, streamId) {
    socket.emit("create_stream", streamId)
}

function joinStream(socket, streamId) {
    socket.emit("join_stream", streamId)
}

async function makeOutgoing(socket, stream) {
    const peerConnection = new RTCPeerConnection(iceConfig)
    peerConnection.onicecandidate = (event) => {
        console.debug(`onIceCandidate:`, event)
        if (event.candidate) {
            socket.emit(
                "share_candidate",
                {
                    type: "candidate",
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                }
            )
        }
    }

    // TODO: Share location!

    // add tracks from stream to peer connection
    stream.getTracks().forEach(track => {
        console.log("Adding track to stream:", track, stream)
        peerConnection.addTrack(track, window.stream)
    });

    console.debug(`creating offer`)
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    socket.emit("share_offer", peerConnection.localDescription)

    return peerConnection
}

async function makeIncoming(socket, video) {
    const peerConnection = new RTCPeerConnection(iceConfig)
    peerConnection.onicecandidate = (event) => {
        console.debug(`on candidate:`, event)
        if (event.candidate) {
            socket.emit(
                "share_candidate",
                {
                    type: "candidate",
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                }
            )
        }
    }

    // TODO: Recieve location!

    // handle tracks from peer connection
    peerConnection.ontrack = (event) => {
        console.debug(`on track`)
        if (video.srcObject !== event.streams[0]) {
            video.srcObject = event.streams[0]
            console.log("recieved and set remote stream")
          }
    }

    return peerConnection
}