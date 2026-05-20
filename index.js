const express = require('express');
const app = express();
app.use(express.json());

// Our live server-side database of 20 clients
let clientList = [
    { id: 1, name: "Alpha CRM" }, { id: 2, name: "Beta Tech" }, { id: 3, name: "Gamma Global" },
    { id: 4, name: "Delta Logistics" }, { id: 5, name: "Epsilon Media" }, { id: 6, name: "Zeta Consulting" },
    { id: 7, name: "Eta FinTech" }, { id: 8, name: "Theta Security" }, { id: 9, name: "Iota Creative" },
    { id: 10, name: "Kappa Industries" }, { id: 11, name: "Lambda Law" }, { id: 12, name: "Mu Medical" },
    { id: 13, name: "Nu Networks" }, { id: 14, name: "Xi Electronics" }, { id: 15, name: "Omicron Retail" },
    { id: 16, name: "Pi Property" }, { id: 17, name: "Rho Rockets" }, { id: 18, name: "Sigma Solutions" },
    { id: 19, name: "Tau Trading" }, { id: 20, name: "Upsilon Ventures" }
];

// 1. ROUTINE SYNC ENDPOINT (Checks for changes every 1 minute)
app.post('/sync', (req, res) => {
    const { status, clientChanges } = req.body;

    // If the app is brand new, send the entire master list
    if (status === "NEW") {
        return res.json({ status: "UPDATE", data: clientList });
    }

    // Process offline changes sent from the phone
    if (clientChanges && clientChanges.length > 0) {
        clientChanges.forEach(change => {
            // Find the client by old name or by an ID
            const client = clientList.find(c => c.name === change.oldname);
            if (client) {
                // Ensure name isn't already taken on the server
                const nameExists = clientList.some(c => c.name === change.newname);
                if (!nameExists) {
                    client.name = change.newname;
                }
            }
        });
        // After applying app changes, return the updated server list back to the phone
        return res.json({ status: "UPDATE", data: clientList });
    }

    // Default response if nothing changed
    res.json({ status: "NONE" });
});

// 2. WEBVIEW VIEWING ENDPOINT (Renders the nice clean HTML page)
app.get('/webview', (req, res) => {
    let listItems = clientList.map(c => `<li>${c.name} <button onclick="editName('${c.name}')">Edit</button></li>`).join('');
    
    let html = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            li { padding: 10px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; }
            button { background: #0E7DAB; color: white; border: none; padding: 5px 10px; borderRadius: 4px; }
        </style>
    </head>
    <body>
        <h2>Senzey Master Client List</h2>
        <ul>${listItems}</ul>
        <script>
            function editName(oldName) {
                let newName = prompt("Edit client name:", oldName);
                if (newName && newName !== oldName) {
                    // Send change to Android app layer via JavaScript Interface
                    if(window.AndroidSync) {
                        window.AndroidSync.processEdit(oldName, newName);
                    }
                }
            }
        </script>
    </body>
    </html>`;
    res.send(html);
});

app.listen(3000, () => console.log('SenzeySync Server running on port 3000'));
