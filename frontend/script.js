
// Validate API Request
async function validateRequest() {

    const method = document.getElementById("method").value;
    const url = document.getElementById("url").value.trim();
    const jsonBody = document.getElementById("jsonBody").value.trim();
    const result = document.getElementById("result");

    let body = null;

    if (!url) {
        result.textContent = "Please enter an API URL";
        return;
    }

    if (method === "POST" || method === "PUT") {
        try {
            body = JSON.parse(jsonBody);
        } catch (error) {
            result.textContent = "Invalid JSON format";
            return;
        }
    }

    result.textContent = "Sending request to backend...";

    try {
        const response = await fetch(
            "http://localhost:5000/api/validate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    method,
                    url,
                    body
                })
            }
        );

        const data = await response.json();

        result.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent =
            data.status === "VALID"
                ? "VALID REQUEST"
                : "INVALID REQUEST";

        heading.style.color =
            data.status === "VALID" ? "green" : "red";

        result.appendChild(heading);

        if (data.status === "VALID") {
            const message = document.createElement("p");
            message.textContent = data.message;
            result.appendChild(message);

            const details = document.createElement("p");
            details.textContent =
                "HTTP Method: " + data.method +
                " | URL: " + data.url;

            result.appendChild(details);

        } else {
            (data.errors || []).forEach(error => {
                const item = document.createElement("p");
                item.textContent = error;
                result.appendChild(item);
            });
        }

        if (data.state) {
            const stateHeading = document.createElement("h3");
            stateHeading.textContent = "DFA Current State";
            result.appendChild(stateHeading);

            const stateText = document.createElement("p");
            stateText.textContent = data.state;
            result.appendChild(stateText);
        }

        if (data.stateHistory) {
            const historyHeading = document.createElement("h3");
            historyHeading.textContent = "DFA State History";
            result.appendChild(historyHeading);

            const historyText = document.createElement("p");
            historyText.textContent =
                data.stateHistory.join(" → ");

            result.appendChild(historyText);
        }

        await loadRequests();

    } catch (error) {
        result.textContent =
            "Backend connection failed. Please check whether server is running.";

        console.error(error);
    }
}


// Load Saved Requests from MongoDB
async function loadRequests() {

    const history = document.getElementById("requestHistory");

    history.textContent = "Loading saved requests...";

    try {
        const response = await fetch(
            "http://localhost:5000/api/requests"
        );

        if (!response.ok) {
            throw new Error("Unable to fetch requests");
        }

        const data = await response.json();

        history.replaceChildren();

        const count = document.createElement("p");
        count.textContent =
            "Total Saved Requests: " + data.count;

        history.appendChild(count);

        if (data.requests.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "No saved requests found.";
            history.appendChild(emptyMessage);
            return;
        }

        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";

        const headers = [
            "Method",
            "URL",
            "Status",
            "State",
            "State History",
            "Errors",
            "Action"
        ];

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        headers.forEach(header => {
            const th = document.createElement("th");
            th.textContent = header;
            th.style.border = "1px solid #ccc";
            th.style.padding = "10px";
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        data.requests.forEach(request => {

            const row = document.createElement("tr");

            const values = [
                request.method || "-",
                request.url || "-",
                request.status || "-",
                request.state || "-",
                (request.stateHistory || []).join(" → "),
                (request.errors || []).join(", ") || "None"
            ];

            values.forEach((value, index) => {

                const cell = document.createElement("td");

                cell.textContent = value;
                cell.style.border = "1px solid #ccc";
                cell.style.padding = "10px";

                if (index === 2) {
                    cell.style.color =
                        request.status === "VALID"
                            ? "green"
                            : "red";
                }

                row.appendChild(cell);
            });

            // Action Column
            const actionCell = document.createElement("td");
            actionCell.style.border = "1px solid #ccc";
            actionCell.style.padding = "10px";

            // Edit Button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.style.backgroundColor = "blue";
            editButton.style.color = "white";
            editButton.style.border = "none";
            editButton.style.padding = "8px";
            editButton.style.marginRight = "5px";
            editButton.style.cursor = "pointer";

            editButton.addEventListener("click", () => {
                editRequest(request);
            });

            actionCell.appendChild(editButton);

            // Delete Button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.style.backgroundColor = "red";
            deleteButton.style.color = "white";
            deleteButton.style.border = "none";
            deleteButton.style.padding = "8px";
            deleteButton.style.cursor = "pointer";

            deleteButton.addEventListener("click", () => {
                deleteRequest(request._id);
            });

            actionCell.appendChild(deleteButton);

            row.appendChild(actionCell);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        history.appendChild(table);

    } catch (error) {
        history.textContent =
            "Unable to load saved requests. Check backend connection.";

        console.error(error);
    }
}


// Edit Request in MongoDB
async function editRequest(request) {

    const method = prompt(
        "Enter HTTP Method (GET, POST, PUT, DELETE):",
        request.method
    );

    if (method === null) return;

    const url = prompt(
        "Enter API URL:",
        request.url
    );

    if (url === null) return;

    const currentBody = request.body
        ? JSON.stringify(request.body, null, 2)
        : "";

    const bodyText = prompt(
        "Enter JSON Request Body:",
        currentBody
    );

    if (bodyText === null) return;

    let body = null;

    if (bodyText.trim() !== "") {
        try {
            body = JSON.parse(bodyText);

            if (
                typeof body !== "object" ||
                body === null ||
                Array.isArray(body)
            ) {
                alert("JSON body must be an object!");
                return;
            }

        } catch (error) {
            alert("Invalid JSON format!");
            return;
        }
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/requests/${encodeURIComponent(request._id)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    method: method.toUpperCase(),
                    url,
                    body
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Update failed");
        }

        alert("Request updated successfully!");

        await loadRequests();

    } catch (error) {
        alert("Unable to update request: " + error.message);
        console.error(error);
    }
}


// Delete Request from MongoDB
async function deleteRequest(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this request?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/requests/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Delete failed");
        }

        alert("Request deleted successfully!");

        await loadRequests();

    } catch (error) {
        alert("Unable to delete request: " + error.message);
        console.error(error);
    }
}
