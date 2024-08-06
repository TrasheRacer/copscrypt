async function streamVideo(video) {
    try {
        const stream = await navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: true
            })
        video.srcObject = stream
    } catch (error) {
        alert(`NO USER MEDIA AVAILABLE!`)
    }
}