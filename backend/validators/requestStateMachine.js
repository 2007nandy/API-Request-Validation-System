
const transitions = {
    Received: {
        START_VALIDATION: "Validating"
    },

    Validating: {
        VALID: "Processing",
        INVALID: "Error"
    },

    Processing: {
        SUCCESS: "Success",
        FAILURE: "Error"
    }
};

function runRequestStateMachine(isValid) {

    let currentState = "Received";

    const stateHistory = [currentState];

    function transition(event) {

        const nextState =
            transitions[currentState]?.[event];

        if (!nextState) {
            throw new Error(
                "Invalid state transition"
            );
        }

        currentState = nextState;

        stateHistory.push(currentState);
    }

    // Start validation
    transition("START_VALIDATION");

    if (!isValid) {
        transition("INVALID");
    } else {
        transition("VALID");

        // Process request
        transition("SUCCESS");
    }

    return {
        currentState,
        stateHistory
    };
}

module.exports = {
    runRequestStateMachine
};
