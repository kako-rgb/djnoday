const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

// Debugging: Check if MONGO_URI is loaded
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is undefined. Please set it in your .env file.");
  process.exit(1); // Exit if the variable is not set
} else {
  console.log("Mongo URI loaded successfully");
}

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://live-request-test.netlify.app", // Production frontend
        "http://127.0.0.1:5500", // Local frontend for testing
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit the application if the connection fails
  });

// Schema and Model
const requestSchema = new mongoose.Schema({
  name: { type: String, default: "User" },
  request: { type: String, required: true },
});

const Request = mongoose.model("Request", requestSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Live Music Request API");
});

// Fetch all requests
app.get("/requests", async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error.message); // Log detailed error message
    res.status(500).json({ error: "Error fetching requests" });
  }
});

// Add a new request
app.post("/requests", async (req, res) => {
  const { name, request } = req.body;
  
  // Validate request body
  if (!request) return res.status(400).json({ error: "Request is required" });

  try {
    const newRequest = new Request({ name, request });
    await newRequest.save();
    res.status(201).json({ message: "Request added successfully", data: newRequest });
  } catch (error) {
    console.error("Error adding request:", error.message); // Log detailed error message
    res.status(500).json({ error: "Error adding request" });
  }
});

// Dynamic Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
