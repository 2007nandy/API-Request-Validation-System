
const EventEmitter = require("events");

const requestEmitter = new EventEmitter();

const failedAttempts = new Map();

// Record failed requests
function recordFailedAttempt(clientId) {

    const count = (failedAttempts.get(clientId) || 0) + 1;

    failedAttempts.set(clientId, count);

    console.log(
        `Failed attempts from ${clientId}: ${count}`
    );

    // Trigger alert after 3 failed attempts
    if (count === 3) {
        requestEmitter.emit("repeatedFailures", {
            clientId,
            count
        });
    }
}

// Reset count after a valid request
function resetFailedAttempts(clientId) {
    failedAttempts.delete(clientId);
}

module.exports = {
    requestEmitter,
    recordFailedAttempt,
    resetFailedAttempts
};
