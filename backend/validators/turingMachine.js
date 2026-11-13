
function runTuringMachine(url) {
    const tape = String(url || "").split("");
    tape.push("□");

    let head = 0;
    let state = "q0";
    const history = ["q0"];

    const isValidCharacter = (char) =>
        /^[A-Za-z0-9_-]$/.test(char);

    while (state !== "qAccept" && state !== "qReject") {
        const symbol = tape[head];

        // q0: Check whether URL starts with /
        if (state === "q0") {
            if (symbol === "/") {
                head++;
                state = "q1";
            } else {
                state = "qReject";
            }
        }

        // q1: Require at least one valid path character
        else if (state === "q1") {
            if (isValidCharacter(symbol)) {
                head++;
                state = "q2";
            } else {
                state = "qReject";
            }
        }

        // q2: Scan remaining URL characters
        else if (state === "q2") {
            if (isValidCharacter(symbol)) {
                head++;
                state = "q2";
            } else if (symbol === "□") {
                state = "qAccept";
            } else {
                state = "qReject";
            }
        }

        history.push(state);
    }

    return {
        accepted: state === "qAccept",
        finalState: state,
        tape: tape.join(""),
        headHistory: history
    };
}

module.exports = { runTuringMachine };
