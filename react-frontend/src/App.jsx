
import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

const API = "https://api-request-validation-backend.onrender.com";

function Status({ ok, children }) {
    return (
        <span className={ok ? "status-pass" : "status-fail"}>
            {children}
        </span>
    );
}

function Dashboard({ requests }) {
    const valid = requests.filter(r => r.status === "VALID").length;
    const invalid = requests.filter(r => r.status === "INVALID").length;

    return (
        <>
            <section className="welcome-card">
                <p className="eyebrow">API MANAGEMENT SYSTEM</p>
                <h2>Welcome to your Dashboard</h2>
                <p>Validate, analyze and monitor your API requests.</p>
            </section>

            <div className="stats-grid">
                <div className="stat-card">
                    <span>Total Requests</span>
                    <h2>{requests.length}</h2>
                </div>
                <div className="stat-card success-stat">
                    <span>Valid Requests</span>
                    <h2>{valid}</h2>
                </div>
                <div className="stat-card error-stat">
                    <span>Invalid Requests</span>
                    <h2>{invalid}</h2>
                </div>
            </div>

            <section className="card">
                <h2>About This Project</h2>
                <p>
                    This system validates API requests using Regular
                    Expressions, CFG, PDA, Turing Machine and DFA.
                    It uses a React frontend, Node.js backend and
                    MongoDB database.
                </p>
            </section>
        </>
    );
}

function DfaDiagram({ history = [] }) {
    const current = history[history.length - 1];

    const nodes = [
        { name: "Received", x: 35, y: 70 },
        { name: "Validating", x: 185, y: 70 },
        { name: "Processing", x: 350, y: 35 },
        { name: "Success", x: 510, y: 35 },
        { name: "Error", x: 350, y: 145 }
    ];

    const active = name => history.includes(name);
    const isCurrent = name => current === name;

    return (
        <div className="dfa-visual">
            <h3>DFA State Transition Diagram</h3>
            <p className="section-description">
                Follow the request through its finite-state transitions.
            </p>

            <div className="dfa-scroll">
                <svg viewBox="0 0 650 220" role="img"
                    aria-label="DFA state transition diagram">

                    <defs>
                        <marker id="dfaArrow" markerWidth="8"
                            markerHeight="8" refX="6" refY="3"
                            orient="auto">
                            <path d="M0,0 L0,6 L6,3 z" fill="#64748b" />
                        </marker>
                    </defs>

                    <path d="M105 70 L150 70"
                        className="dfa-arrow" markerEnd="url(#dfaArrow)" />
                    <text x="125" y="55" className="dfa-label">START_VALIDATION</text>

                    <path d="M270 65 L315 42"
                        className="dfa-arrow" markerEnd="url(#dfaArrow)" />
                    <text x="278" y="25" className="dfa-label">VALID</text>

                    <path d="M445 35 L475 35"
                        className="dfa-arrow" markerEnd="url(#dfaArrow)" />
                    <text x="450" y="20" className="dfa-label">SUCCESS</text>

                    <path d="M220 100 L315 145"
                        className="dfa-arrow error-arrow"
                        markerEnd="url(#dfaArrow)" />
                    <text x="255" y="132" className="dfa-label">INVALID</text>

                    {nodes.map(node => (
                        <g key={node.name}>
                            <rect
                                x={node.x}
                                y={node.y - 23}
                                width="120"
                                height="46"
                                rx="12"
                                className={
                                    "dfa-node " +
                                    (isCurrent(node.name)
                                        ? "dfa-current "
                                        : active(node.name)
                                            ? "dfa-visited "
                                            : "") +
                                    (node.name === "Error" ? "dfa-error" : "") +
                                    (node.name === "Success" ? "dfa-success" : "")
                                }
                            />
                            <text
                                x={node.x + 60}
                                y={node.y + 5}
                                textAnchor="middle"
                                className="dfa-node-text"
                            >
                                {node.name}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            <div className="dfa-legend">
                <span>● Visited state</span>
                <span>● Current state</span>
                <span>● Accept state</span>
                <span>● Reject state</span>
            </div>

            <h3>Actual DFA State History</h3>
            <div className="state-history">
                {history.length > 0 ? history.map((state, index) => (
                    <div className="history-item" key={index}>
                        <span className="history-number">{index + 1}</span>
                        <strong>{state}</strong>
                        {index !== history.length - 1 && <span>→</span>}
                    </div>
                )) : <p>State history not available.</p>}
            </div>

            <h3>DFA Transition Table</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Current State</th>
                            <th>Input Event</th>
                            <th>Next State</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Received</td><td>START_VALIDATION</td><td>Validating</td></tr>
                        <tr><td>Validating</td><td>VALID</td><td>Processing</td></tr>
                        <tr><td>Validating</td><td>INVALID</td><td>Error</td></tr>
                        <tr><td>Processing</td><td>SUCCESS</td><td>Success</td></tr>
                        <tr><td>Processing</td><td>FAILURE</td><td>Error</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FlatResult({ result }) {
    const errors = result.errors || [];
    const grammar = result.grammar;
    const pda = result.pda;
    const tm = result.turingMachine;

    const regexOK = !errors.some(e =>
        e.includes("Invalid API URL") ||
        e.includes("Invalid Email Format")
    );

    return (
        <section className="card">
            <h2>FLAT Validation Analysis</h2>
            <p className="section-description">
                Detailed results of Formal Languages and Automata Theory.
            </p>

            <div className="flat-grid">
                <div className="flat-card">
                    <h3>01. Regex Validator</h3>
                    <p>Checks URL and email formats using regular expressions.</p>
                    <Status ok={regexOK}>
                        {regexOK ? "PASSED" : "FAILED"}
                    </Status>
                </div>

                <div className="flat-card">
                    <h3>02. CFG Validator</h3>
                    <p>Checks the request method, URL and body structure.</p>
                    {grammar ? (
                        <Status ok={grammar.isGrammarValid}>
                            {grammar.isGrammarValid ? "PASSED" : "FAILED"}
                        </Status>
                    ) : <p>Result unavailable</p>}
                    {grammar?.grammarErrors?.map((e, i) =>
                        <p className="invalid" key={i}>{e}</p>
                    )}
                </div>

                <div className="flat-card">
                    <h3>03. PDA Validator</h3>
                    <p>Uses a stack to check balanced JSON brackets.</p>
                    {pda ? (
                        <>
                            <Status ok={pda.accepted}>
                                {pda.accepted ? "ACCEPTED" : "REJECTED"}
                            </Status>
                            <p>Stack: {pda.pdaState}</p>
                            <div className="operation-list">
                                {pda.stackHistory?.map((step, i) =>
                                    <p key={i}>{step}</p>
                                )}
                            </div>
                            {pda.pdaErrors?.map((e, i) =>
                                <p className="invalid" key={i}>{e}</p>
                            )}
                        </>
                    ) : <p>Result unavailable</p>}
                </div>

                <div className="flat-card">
                    <h3>04. Turing Machine</h3>
                    <p>Scans URL characters and checks the allowed pattern.</p>
                    {tm ? (
                        <>
                            <Status ok={tm.accepted}>
                                {tm.accepted ? "ACCEPTED" : "REJECTED"}
                            </Status>
                            <p>Final State: {tm.finalState}</p>
                            <p className="code-output">Tape: {tm.tape}</p>
                            <p>State History:</p>
                            <p className="code-output">
                                {tm.headHistory?.join(" → ")}
                            </p>
                        </>
                    ) : <p>Result unavailable</p>}
                </div>
            </div>
        </section>
    );
}

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method, url, body: parsedBody })
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
                <h2>API Request Builder</h2>
                <p className="section-description">
                    Enter your API details to start validation.
                </p>

                <form onSubmit={validateRequest}>
                    <label>HTTP Method</label>
                    <select value={method}
                        onChange={e => setMethod(e.target.value)}>
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </select>

                    <label>API URL</label>
                    <input value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="/users" required />

                    <label>JSON Request Body</label>
                    <textarea rows="6" value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder='{"email":"student@gmail.com"}' />

                    <button type="submit" disabled={loading}>
                        {loading ? "Validating..." : "Validate API Request"}
                    </button>
                </form>
            </section>

            {result && (
                <>
                    <section className="card">
                        <h2>Validation Result</h2>
                        <h2 className={result.status === "VALID"
                            ? "valid" : "invalid"}>
                            {result.status === "VALID"
                                ? "✓ VALID REQUEST"
                                : "✕ " + (result.status || "ERROR")}
                        </h2>
                        {result.message && <p>{result.message}</p>}
                        {result.errors?.map((e, i) =>
                            <p className="invalid" key={i}>{e}</p>
                        )}
                    </section>

                    <FlatResult result={result} />

                    <section className="card">
                        <DfaDiagram history={result.stateHistory || []} />
                        <h3>Current DFA State</h3>
                        <Status ok={result.state === "Success"}>
                            {result.state || "Unavailable"}
                        </Status>
                    </section>
                </>
            )}
        </>
    );
}

async function editRequest(request, loadRequests) {
    const newMethod = window.prompt("Enter HTTP Method", request.method);
    if (!newMethod) return;

    const newUrl = window.prompt("Enter API URL", request.url);
    if (!newUrl) return;

    const newBody = window.prompt(
        "Enter JSON Body",
        JSON.stringify(request.body || {}, null, 2)
    );
    if (newBody === null) return;

    try {
        const response = await fetch(`${API}/api/requests/${request._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                method: newMethod.toUpperCase(),
                url: newUrl,
                body: JSON.parse(newBody)
            })
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.message || "Update failed");
            return;
        }

        alert("Request updated successfully!");
        await loadRequests();
    } catch {
        alert("Invalid JSON or server error");
    }
}

function SavedRequests({ requests, loadRequests, deleteRequest }) {
    return (
        <section className="card">
            <div className="requests-heading">
                <h2>Saved API Requests</h2>
                <button onClick={loadRequests}>Refresh Requests</button>
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(request => (
                            <tr key={request._id}>
                                <td>{request.method}</td>
                                <td>{request.url}</td>
                                <td>
                                    <Status ok={request.status === "VALID"}>
                                        {request.status}
                                    </Status>
                                </td>
                                <td>{request.state}</td>
                                <td>{request.stateHistory?.join(" → ")}</td>
                                <td>{request.errors?.join(", ") || "None"}</td>
                                <td>
                                    <button onClick={() =>
                                        editRequest(request, loadRequests)}>
                                        Edit
                                    </button>
                                    <button className="delete-btn"
                                        onClick={() => deleteRequest(request._id)}>
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

function App() {
    const [requests, setRequests] = useState([]);

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
        } catch {
            alert("Unable to delete request");
        }
    };

    return (
        <div className="app">
            <header className="header">
                <h1>API Request Validation System</h1>
                <p>Validate • Analyze • Monitor API Requests</p>
            </header>

            <nav className="navbar">
                <Link to="/">Dashboard</Link>
                <Link to="/builder">Request Builder</Link>
                <Link to="/saved">Saved Requests</Link>
            </nav>

            <main className="container">
                <Routes>
                    <Route path="/" element={
                        <Dashboard requests={requests} />
                    } />
                    <Route path="/builder" element={
                        <RequestBuilder loadRequests={loadRequests} />
                    } />
                    <Route path="/saved" element={
                        <SavedRequests
                            requests={requests}
                            loadRequests={loadRequests}
                            deleteRequest={deleteRequest}
                        />
                    } />
                </Routes>
            </main>
        </div>
    );
}

export default App;
