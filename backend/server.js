
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const Request = require("./models/Request");

const {
    requestEmitter,
    recordFailedAttempt,
    resetFailedAttempts
} = require("./validators/failedRequestMonitor");

const {
    validateEmail,
    validateURL
} = require("./validators/regexValidator");

const {
    runRequestStateMachine
} = require("./validators/requestStateMachine");

const {
    validateRequestGrammar
} = require("./validators/cfgValidator");

const {
    validateJSONWithPDA
} = require("./validators/pdaValidator");

// Turing Machine
const {
    runTuringMachine
} = require("./validators/turingMachine");

const app = express();
const PORT = 5000;

connectDB();

app.use(cors());
app.use(express.json());

// Repeated failed request alert
requestEmitter.on("repeatedFailures", (data) => {
    console.log("⚠️ SECURITY ALERT!");
    console.log(
        `Client ${data.clientId} has sent ${data.count} failed requests!`
    );
});

// Home route
app.get("/", (req, res) => {
    res.send("API Request Validation System is Running!");
});

// Get all saved requests
app.get("/api/requests", async (req, res) => {
    try {
        const requests = await Request.find().sort({
            createdAt: -1
        });

        res.status(200).json({
            count: requests.length,
            requests
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch requests",
            error: error.message
        });
    }
});

// Delete a saved request
app.delete("/api/requests/:id", async (req, res) => {
    try {
        const deletedRequest = await Request.findByIdAndDelete(
            req.params.id
        );

        if (!deletedRequest) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        res.status(200).json({
            message: "Request deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to delete request",
            error: error.message
        });
    }
});

// Update a saved request
app.put("/api/requests/:id", async (req, res) => {
    try {
        const { method, url, body } = req.body;
        const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

        let errors = [];

        // 1. HTTP Method Validation
        if (!allowedMethods.includes(method)) {
            errors.push("Invalid HTTP Method");
        }

        // 2. URL Regex Validation
        if (
            typeof url !== "string" ||
            !validateURL(url)
        ) {
            errors.push("Invalid API URL");
        }

        // 3. JSON Body Validation
        if (
            (method === "POST" || method === "PUT") &&
            (body === null ||
             typeof body !== "object" ||
             Array.isArray(body))
        ) {
            errors.push("Invalid JSON Body");
        }

        // 4. Email Regex Validation
        if (
            body &&
            typeof body === "object" &&
            !Array.isArray(body) &&
            body.email !== undefined &&
            !validateEmail(body.email)
        ) {
            errors.push("Invalid Email Format");
        }

        // 5. CFG Validation
        const grammarResult = validateRequestGrammar(
            method,
            url,
            body
        );

        if (!grammarResult.isGrammarValid) {
            errors.push(...grammarResult.grammarErrors);
        }

        // 6. PDA Validation
        const pdaResult = validateJSONWithPDA(body);

        if (!pdaResult.accepted) {
            errors.push(...pdaResult.pdaErrors);
        }

        // 7. Turing Machine Validation
        const turingResult = runTuringMachine(url);

        if (!turingResult.accepted) {
            errors.push("Turing Machine: Invalid URL");
        }

        // 8. DFA Validation
        const dfaResult = runRequestStateMachine(
            errors.length === 0
        );

        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id,
            {
                method,
                url,
                body,
                status: errors.length === 0 ? "VALID" : "INVALID",
                errors,
                state: dfaResult.currentState,
                stateHistory: dfaResult.stateHistory
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedRequest) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        res.status(200).json({
            message: "Request updated successfully",
            request: updatedRequest,
            grammar: grammarResult,
            pda: pdaResult,
            turingMachine: turingResult,
            state: dfaResult.currentState,
            stateHistory: dfaResult.stateHistory
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to update request",
            error: error.message
        });
    }
});

// API Validation Route
app.post("/api/validate", async (req, res) => {
    try {
        const { method, url, body } = req.body || {};

        let errors = [];

        const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

        // 1. HTTP Method Validation
        if (!allowedMethods.includes(method)) {
            errors.push("Invalid HTTP Method");
        }

        // 2. URL Regex Validation
        if (
            typeof url !== "string" ||
            !validateURL(url)
        ) {
            errors.push("Invalid API URL");
        }

        // 3. JSON Body Validation
        if (
            (method === "POST" || method === "PUT") &&
            (body === null ||
             typeof body !== "object" ||
             Array.isArray(body))
        ) {
            errors.push("Invalid JSON Body");
        }

        // 4. Email Regex Validation
        if (
            body &&
            typeof body === "object" &&
            !Array.isArray(body) &&
            body.email !== undefined &&
            !validateEmail(body.email)
        ) {
            errors.push("Invalid Email Format");
        }

        // 5. CFG Validation
        const grammarResult = validateRequestGrammar(
            method,
            url,
            body
        );

        if (!grammarResult.isGrammarValid) {
            errors.push(...grammarResult.grammarErrors);
        }

        // 6. PDA Validation
        const pdaResult = validateJSONWithPDA(body);

        if (!pdaResult.accepted) {
            errors.push(...pdaResult.pdaErrors);
        }

        // 7. Turing Machine Validation
        const turingResult = runTuringMachine(url);

        if (!turingResult.accepted) {
            errors.push("Turing Machine: Invalid URL");
        }

        // 8. DFA State Machine
        const dfaResult = runRequestStateMachine(
            errors.length === 0
        );

        // 9. Repeated Failed Request Detection
        const clientId = req.ip;

        if (errors.length > 0) {
            recordFailedAttempt(clientId);
        } else {
            resetFailedAttempts(clientId);
        }

        // 10. Save Request in MongoDB
        const savedRequest = await Request.create({
            method,
            url,
            body,
            status: errors.length === 0 ? "VALID" : "INVALID",
            errors,
            state: dfaResult.currentState,
            stateHistory: dfaResult.stateHistory
        });

        // 11. Invalid Request Response
        if (errors.length > 0) {
            return res.status(400).json({
                status: "INVALID",
                errors,
                grammar: grammarResult,
                pda: pdaResult,
                turingMachine: turingResult,
                state: dfaResult.currentState,
                stateHistory: dfaResult.stateHistory,
                requestId: savedRequest._id
            });
        }

        // 12. Valid Request Response
        return res.status(200).json({
            status: "VALID",
            message: "API Request Validation Successful!",
            method,
            url,

            validation: {
                httpMethod: "Passed",
                url: "Passed",
                json: "Passed",
                regex: "Passed",
                cfg: "Passed",
                pda: "Passed",
                turingMachine: "Passed",
                dfa: "Passed"
            },

            grammar: grammarResult,
            pda: pdaResult,
            turingMachine: turingResult,
            state: dfaResult.currentState,
            stateHistory: dfaResult.stateHistory,
            requestId: savedRequest._id
        });

    } catch (error) {
        console.error("Validation Error:", error);

        return res.status(500).json({
            status: "ERROR",
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});
