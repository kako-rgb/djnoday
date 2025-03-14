const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Validate environment variables
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is undefined");
  process.exit(1);
}

const app = express();

// Enhanced CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://nodayzentertainment.co.ke",
      "http://127.0.0.1:5500"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection with improved error handling
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => {
  console.error("MongoDB connection failed:", err.message);
  process.exit(1);
});

// Schema and Model
const requestSchema = new mongoose.Schema({
  name: { type: String, default: "User" },
  request: { type: String, required: true }
});

const Request = mongoose.model("Request", requestSchema);

// Enhanced Routes
app.get("/requests", async (req, res) => {
  try {
    const requests = await Request.find().sort({ _id: -1 }).limit(50);
    res.set("Cache-Control", "no-store");
    res.json(requests);
  } catch (error) {
    console.error("GET Error:", error);
    res.status(500).json({ 
      error: "Server error",
      details: error.message
    });
  }
});

app.post("/requests", async (req, res) => {
  try {
    const { name, request } = req.body;
    if (!request) return res.status(400).json({ error: "Request required" });

    const newRequest = new Request({ 
      name: name?.trim() || "User",
      request: request.trim()
    });
    
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error("POST Error:", error);
    res.status(500).json({ 
      error: "Failed to save request",
      details: error.message
    });
  }
});

// Added DELETE endpoint
app.delete("/requests/:id", async (req, res) => {
  try {
    const deleted = await Request.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Request not found" });
    res.json({ message: "Request deleted" });
  } catch (error) {
    console.error("DELETE Error:", error);
    res.status(500).json({ 
      error: "Deletion failed",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
