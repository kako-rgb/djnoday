
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

let requests = [];
let requestId = 1;

// Fetch all requests
app.get("/requests", (req, res) => {
  const now = Date.now();
  requests = requests.filter((req) => now - req.timestamp < 12 * 60 * 60 * 1000); // Remove expired requests
  res.json(requests);
});

// Add a new request
app.post("/requests", (req, res) => {
  const { name, request } = req.body;
  requests.push({ id: requestId++, name, request, timestamp: Date.now() });
  res.status(201).json({ message: "Request added!" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
