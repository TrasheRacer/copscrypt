"use strict";

// controls
const createBtn = document.getElementById("create-btn");
const joinBtn = document.getElementById("join-btn");
const connectForm = document.getElementById("connect-form");
const connectIn = document.getElementById("connect-input");
const connectBtn = document.getElementById("connect-btn");
const credentialIn = document.getElementById("creds-input");

// defaults
connectIn.value = ""

// handlers
createBtn.addEventListener("click", () => {
    const creds = credentialIn.value
    if (creds.length > 0) {
        window.location.href = `/stream?credentials=${creds}`
    } else {
        alert("INVALID!")
    }
})
joinBtn.addEventListener("click", () => {
    connectForm.hidden = false
})
connectBtn.addEventListener("click", () => {
    const id = connectIn.value
    const creds = credentialIn.value
    if (id.length > 0 && creds.length > 0) {
        window.location.href = `/stream#${id}?credentials=${creds}`
    } else {
        alert("INVALID!")
    }
})