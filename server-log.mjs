/**
 * log to console with timestamp
 * @param {string} output should be lowercase
 */
function log(output) {
    const now = new Date();
    console.log(`${now.toLocaleString("en-GB")}: ${output}`)
}

export { log }