
function validateJSONWithPDA(body) {
    const stack = [];
    const stackHistory = [];
    const errors = [];

    // Empty body is allowed
    if (body === null || body === undefined) {
        return {
            accepted: true,
            pdaState: "Accepted",
            stackHistory: ["Stack is empty"],
            pdaErrors: []
        };
    }

    const input = JSON.stringify(body);

    let insideString = false;
    let escaped = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        // Ignore brackets inside JSON strings
        if (insideString) {
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === '"') {
                insideString = false;
            }
            continue;
        }

        if (char === '"') {
            insideString = true;
            continue;
        }

        // Push opening brackets into stack
        if (char === "{" || char === "[") {
            stack.push(char);
            stackHistory.push(`PUSH ${char}`);
        }

        // Pop matching closing brackets
        else if (char === "}" || char === "]") {
            const top = stack.pop();

            if (
                (char === "}" && top !== "{") ||
                (char === "]" && top !== "[")
            ) {
                errors.push("PDA Error: Mismatched brackets");
                break;
            }

            stackHistory.push(`POP ${top}`);
        }
    }

    if (stack.length > 0) {
        errors.push("PDA Error: Unclosed brackets");
    }

    const accepted = errors.length === 0;

    return {
        accepted,
        pdaState: accepted ? "Accepted" : "Rejected",
        stackHistory,
        pdaErrors: errors
    };
}

module.exports = { validateJSONWithPDA };
