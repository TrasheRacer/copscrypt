"use strict";

// Call when page loads
function onLoad() {
    // If there's a hash in the URL then store it as the broadcast ID;
    // else prompt to either identify a broadcast or create a new one
    const urlHash = window.location.hash.substring(1);
    if (urlHash) {
        console.debug(`found URL hash: ${urlHash}`)
        window.broadcastData.broadcastID = urlHash
        
    } else {
        console.debug(`no URL hash so prompting user for input`)
        const defaultID = Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
        const newID = window.prompt("create or join?", defaultID)
    }
}