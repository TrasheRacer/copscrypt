"use strict";

/**
 * log to console with timestamp
 * @param {string} output should be lowercase
 */
function log(output, arg) {
    const now = new Date();
    if (arg) {
        console.log(`${now.toLocaleString("en-GB")} ${output}:`, arg)
    } else {
        console.log(`${now.toLocaleString("en-GB")} ${output}`)
    }
}

/**
 * log to console with timestamp
 * @param {string} output should be lowercase
 */
function warn(output, arg) {
    const now = new Date();
    if (arg) {
        console.warn(`${now.toLocaleString("en-GB")} ${output}:`, arg)
    } else {
        console.warn(`${now.toLocaleString("en-GB")} ${output}`)
    }
}

/**
 * log to console with timestamp
 * @param {string} output should be lowercase
 */
function debug(output, arg) {
    const now = new Date();
    if (arg) {
        console.debug(`${now.toLocaleString("en-GB")} ${output}:`, arg)
    } else {
        console.debug(`${now.toLocaleString("en-GB")} ${output}`)
    }
}

export { log, warn, debug }