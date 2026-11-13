
const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

const allowedPaths = [
    "users",
    "products",
    "orders"
];

// CFG-style request structure validation
function validateRequestGrammar(method, url, body) {

    const errors = [];

    // Grammar Rule 1:
    // Request -> Method URL Body

    if (!allowedMethods.includes(method)) {
        errors.push("CFG Error: Invalid HTTP Method");
    }

    // Grammar Rule 2:
    // URL -> / Path

    const urlPattern = /^\/[A-Za-z0-9_-]+$/;

    if (!urlPattern.test(url)) {
        errors.push("CFG Error: Invalid URL Structure");
    }

    // Grammar Rule 3:
    // Body -> JSON | Empty

    if (
        body !== null &&
        (typeof body !== "object" || Array.isArray(body))
    ) {
        errors.push("CFG Error: Invalid JSON Body Structure");
    }

    return {
        isGrammarValid: errors.length === 0,
        grammarErrors: errors
    };
}

module.exports = { validateRequestGrammar };
