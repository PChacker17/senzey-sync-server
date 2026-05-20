const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let clientDatabase = [
    { id: 1, name: "Kaya Moore" },
    { id: 2, name: "Taya Chamberlain" },
    { id: 3, name: "Woody Leach" },
    { id: 4, name: "Shane Atkinson" },
    { id: 5, name: "Jenna Cooper" },
    { id: 6, name: "Kye Palmer" },
    { id: 7, name: "Nicola Robles" },
    { id: 8, name: "Tomasz Mccabe" },
    { id: 9, name: "Katerina Knight" },
    { id: 10, name: "Leonard Vaughn" },
    { id: 11, name: "Anaya Hurley" },
    { id: 12, name: "Diane Strong" },
    { id: 13, name: "Nell Reeves" },
    { id: 14, name: "Ridwan Hubbard" },
    { id: 15, name: "Lexie Nicholson" },
    { id: 16, name: "Isabelle Fletcher" },
    { id: 17, name: "Tatiana Khan" },
    { id: 18, name: "Maria Kendall" },
    { id: 19, name: "Marilyn Gill" },
    { id: 20, name: "Angelina Miles" }
];

// 1. ROUTINE SYNC ENDPOINT
app.post('/sync', (req, res) => {
    const { status, clientChanges } = req.body;

    if (status === "UPDATE" && clientChanges && clientChanges.length > 0) {
        console.log("Received data sync payload:", clientChanges);
        
        clientChanges.forEach(change => {
            const client = clientDatabase.find(c => c.name === change.oldname);
            if (client) {
                const nameExists = clientDatabase.some(c => c.name === change.newname);
                if (!nameExists) {
                    client.name = change.newname;
                    console.log(`Success: Changed '${change.oldname}' to '${change.newname}'`);
                } else {
                    console.log(`Aborted: Name '${change.newname}' already exists.`);
                }
            } else {
                console.log(`Error: Could not find matching server client for name: '${change.oldname}'`);
            }
        });
        return res.json({ status: "UPDATE", data: clientDatabase });
    }

    res.json({ status: "UPDATE", data: clientDatabase });
});

// 2. WEBVIEW VIEWING ENDPOINT
app.get('/webview', (req, res) => {
    let listItems = clientDatabase.map(c => `
        <li>
            <span>${c.name}</span> 
            <button onclick="editName('${c.name}')">Edit</button>
        </li>
    `).join('');
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 16px; background-color: #f8f9fa; }
            h2 { color: #0E7DAB; margin-bottom: 20px; }
            ul { list-style-type: none; padding: 0; margin: 0; }
            li { background: white; margin-bottom: 10px; padding: 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            button { background: #0E7DAB; color: white; border: none; padding: 8px 14px; border-radius: 66px; font-weight: bold; cursor: pointer; }
        </style>
    </head>
    <body>
        <h2>Senzey Master Client List</h2>
        <ul>${listItems}</ul>
        <script>
            function editName(oldName) {
                let newName = prompt("Edit client name:", oldName);
                if (newName && newName.trim() !== "" && newName.trim() !== oldName) {
                    if (window.AndroidSync) {
                        window.AndroidSync.processEdit(oldName, newName.trim());
                    }
                }
            }
        </script>
    </body>
    </html>`;
    res.send(html);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
