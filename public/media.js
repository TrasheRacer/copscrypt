"use strict";

async function captureVideo(video) {
    try {
        const stream = await navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: true
            })
        video.srcObject = stream
        return stream
    } catch (error) {
        alert(`NO USER MEDIA AVAILABLE!`)
    }
}