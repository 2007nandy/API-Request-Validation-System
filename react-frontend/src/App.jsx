
import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

const API = "http://localhost:5000";

// Dashboard Page
function Dashboard({ requests }) {
    return (
        <section className="card">
            <h2>Dashboard</h2>
            <p>Welcome to API Request Validation System!</p>
            <h3>Total Saved Requests: {requests.length}</h3>
            <p>Manage and validate your API requests easily.</p>
        </section>
    );
}

// Request Builder Page
function RequestBuilder({ loadRequests }) {
    const [method, setMethod] = useState("POST");
    const [url, setUrl] = useState("/users");
    const [body, setBody] = useState('{\n  "email": "student@gmail.com"\n}');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            let parsedBody = null;

            if (method === "POST" || method === "PUT") {
                parsedBody = JSON.parse(body);
            }

            const response = await fetch(`${API}/api/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    method,
                    url,
                    body: parsedBody
                })
            });

            const data = await response.json();
            setResult(data);
            await loadRequests();

        } catch (error) {
            setResult({
                status: "ERROR",
                message: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="card">
                <h2>Request Builder</h2>

                <form onSubmit={validateRequest}>
                    <label>HTTP Method</label>

                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                    >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </select>

                    <label>API URL</label>

                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="/users"
                        required
                    />

                    <label>JSON Request Body</label>

                    <textarea
                        rows="5"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder='{"email":"student@gmail.com"}'
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Validating..." : "Validate Request"}
                    </button>
                </form>
            </section>

            {result && (
                <section className="card">
                    <h2>Validation Result</h2>

                    <h3 className={
                        result.status === "VALID" ? "valid" : "invalid"
                    }>
                        {result.status === "VALID"
                            ? "VALID REQUEST"
                            : "INVALID REQUEST"}
                    </h3>

                    {result.message && <p>{result.message}</p>}

                    {result.errors?.map((error, index) => (
                        <p className="invalid" key={index}>
                            {error}
                        </p>
                    ))}

                    {/* DFA Validation */}
                    <h3>DFA Current State</h3>
                    <p>{result.state || "Error"}</p>

                    <h3>DFA State History</h3>
                    <p>{result.stateHistory?.join(" → ")}</p>

                    {/* CFG Validation */}
                    <h3>CFG Grammar Validation</h3>

                    {result.grammar ? (
                        <>
                            <p className={
                                result.grammar.isGrammarValid
                                    ? "valid"
                                    : "invalid"
                            }>
                                {result.grammar.isGrammarValid
                                    ? "CFG Validation Passed"
                                    : "CFG Validation Failed"}
                            </p>

                            {result.grammar.grammarErrors?.map(
                                (error, index) => (
                                    <p className="invalid" key={index}>
                                        {error}
                                    </p>
                                )
                            )}
                        </>
                    ) : (
                        <p className="invalid">
                            CFG result was not received from backend.
                        </p>
                    )}

                    {/* PDA Validation */}
                    <h3>PDA Validation</h3>

                    {result.pda ? (
                        <>
                            <p className={
                                result.pda.accepted ? "valid" : "invalid"
                            }>
                                {result.pda.accepted
                                    ? "PDA Validation Passed"
                                    : "PDA Validation Failed"}
                            </p>

                            <h3>PDA Current State</h3>
                            <p>{result.pda.pdaState}</p>

                            <h3>PDA Stack History</h3>

                            {result.pda.stackHistory?.length > 0 ? (
                                result.pda.stackHistory.map(
                                    (step, index) => (
                                        <p key={index}>{step}</p>
                                    )
                                )
                            ) : (
                                <p>Stack is empty</p>
                            )}

                            {result.pda.pdaErrors?.map(
                                (error, index) => (
                                    <p className="invalid" key={index}>
                                        {error}
                                    </p>
                                )
                            )}
                        </>
                    ) : (
                        <p className="invalid">
                            PDA result was not received from backend.
                        </p>
                    )}

                    {/* Turing Machine Validation */}
                    <h3>Turing Machine Validation</h3>

                    {result.turingMachine ? (
                        <>
                            <p className={
                                result.turingMachine.accepted
                                    ? "valid"
                                    : "invalid"
                            }>
                                {result.turingMachine.accepted
                                    ? "Turing Machine Validation Passed"
                                    : "Turing Machine Validation Failed"}
                            </p>

                            <h3>TM Final State</h3>
                            <p>{result.turingMachine.finalState}</p>

                            <h3>TM Tape</h3>
                            <p>{result.turingMachine.tape}</p>

                            <h3>TM State History</h3>
                            <p>
                                {result.turingMachine.headHistory?.join(" → ")}
                            </p>
                        </>
                    ) : (
                        <p className="invalid">
                            Turing Machine result was not received from backend.
                        </p>
                    )}
                </section>
            )}
        </>
    );
}

// Edit Request Function
async function editRequest(request, loadRequests) {
    const newMethod = window.prompt(
        "Enter HTTP Method",
        request.method
    );

    if (!newMethod) return;

    const newUrl = window.prompt(
        "Enter API URL",
        request.url
    );

    if (!newUrl) return;

    const newBody = window.prompt(
        "Enter JSON Body",
        JSON.stringify(request.body || {}, null, 2)
    );

    if (newBody === null) return;

    try {
        const response = await fetch(
            `${API}/api/requests/${request._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    method: newMethod.toUpperCase(),
                    url: newUrl,
                    body: JSON.parse(newBody)
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Update failed");
            return;
        }

        alert("Request updated successfully!");
        await loadRequests();

    } catch (error) {
        alert("Invalid JSON or server error");
    }
}

// Saved Requests Page
function SavedRequests({ requests, loadRequests, deleteRequest }) {
    return (
        <section className="card">
            <div className="requests-heading">
                <h2>Saved API Requests</h2>

                <button onClick={loadRequests}>
                    Refresh Requests
                </button>
            </div>

            <h3>Total Saved Requests: {requests.length}</h3>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Method</th>
                            <th>URL</th>
                            <th>Status</th>
                            <th>State</th>
                            <th>State History</th>
                            <th>Errors</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {requests.map((request) => (
                            <tr key={request._id}>
                                <td>{request.method}</td>
                                <td>{request.url}</td>
                                <td>{request.status}</td>
                                <td>{request.state}</td>
                                <td>
                                    {request.stateHistory?.join(" → ")}
                                </td>
                                <td>
                                    {request.errors?.join(", ") || "None"}
                                </td>
                                <td>
                                    <button
                                        onClick={() =>
                                            editRequest(request, loadRequests)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={() =>
                                            deleteRequest(request._id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

// Main App
function App() {
    const [requests, setRequests] = useState([]);

    // Load MongoDB requests
    const loadRequests = async () => {
        try {
            const response = await fetch(`${API}/api/requests`);
            const data = await response.json();
            setRequests(data.requests || []);
        } catch (error) {
            console.error("Unable to load requests:", error);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // Delete Request
    const deleteRequest = async (id) => {
        if (!window.confirm("Delete this request?")) return;

        try {
            const response = await fetch(`${API}/api/requests/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                alert("Unable to delete request");
                return;
            }

            alert("Request deleted successfully!");
            await loadRequests();

        } catch (error) {
            alert("Unable to delete request");
        }
    };

    return (
        <div className="app">
            <header className="header">
                <h1>API Request Validation System</h1>
                <p>Validate your API requests easily</p>
            </header>

            <nav className="navbar">
                <Link to="/">Dashboard</Link>
                <Link to="/builder">Request Builder</Link>
                <Link to="/saved">Saved Requests</Link>
            </nav>

            <main className="container">
                <Routes>
                    <Route
                        path="/"
                        element={<Dashboard requests={requests} />}
                    />

                    <Route
                        path="/builder"
                        element={
                            <RequestBuilder
                                loadRequests={loadRequests}
                            />
                        }
                    />

                    <Route
                        path="/saved"
                        element={
                            <SavedRequests
                                requests={requests}
                                loadRequests={loadRequests}
                                deleteRequest={deleteRequest}
                            />
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;
