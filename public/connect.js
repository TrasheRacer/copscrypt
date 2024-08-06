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
    const newId = Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
    window.location.href = `/stream#${newId}`
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