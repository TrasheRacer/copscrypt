"use strict";

// controls
const createBtn = document.getElementById("create-btn");
const joinBtn = document.getElementById("join-btn");
const connectForm = document.getElementById("connect-form");
const connectIn = document.getElementById("connect-input");
const connectBtn = document.getElementById("connect-btn");

// defaults
connectIn.value = ""

// handlers
createBtn.addEventListener("click", () => {
    window.location.href = `/stream`
})
joinBtn.addEventListener("click", () => {
    connectForm.hidden = false
})
connectBtn.addEventListener("click", () => {
    const id = connectIn.value
    if (id.length > 0) {
        window.location.href = `/stream#${id}`
    } else {
        alert("INVALID!")
    }
})