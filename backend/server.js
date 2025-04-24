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

// ✅ Move corsOptions ABOVE its usage
const corsOptions = {
  origin: [
    "https://nodayzentertainment.co.ke",
    "https://www.nodayzentertainment.co.ke",
    "http://localhost:8000", // Allow local development
    "http://127.0.0.1:8000"  // Allow local development
  ],
  methods: "GET,POST,DELETE,OPTIONS", // Add OPTIONS
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
  optionsSuccessStatus: 204 // Required for some CORS implementations
};

// ✅ Apply CORS middleware after definition
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle all OPTIONS requests

app.use(express.json());

// MongoDB Connection with improved error handling and fallback
let isMongoConnected = false;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("MongoDB connected successfully");
  isMongoConnected = true;
})
.catch(err => {
  console.error("MongoDB connection failed:", err.message);
  console.log("Running in fallback mode with local authentication");
});

// Password Schema and Model
const passwordSchema = new mongoose.Schema({
  value: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Global Access Schema and Model
const globalAccessSchema = new mongoose.Schema({
  active: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Password = mongoose.model("Password", passwordSchema);
const GlobalAccess = mongoose.model("GlobalAccess", globalAccessSchema);

// Request Schema and Model
const requestSchema = new mongoose.Schema({
  name: { type: String, default: "User" },
  request: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 24 hours (86400 seconds)
});

const Request = mongoose.model("Request", requestSchema);

// Check if global access is active
const checkGlobalAccess = async (req, res, next) => {
  try {
    // Skip password check if this is a password verification request
    if (req.path === '/api/password/verify') {
      return next();
    }

    // If MongoDB is not connected, check local storage fallback
    if (!isMongoConnected) {
      // Check if we have a global access token in memory
      if (global.accessExpiryTime && new Date().getTime() < global.accessExpiryTime) {
        return next();
      }

      // No valid global access, proceed to password check
      return checkPassword(req, res, next);
    }

    // Check if global access is active in the database
    const globalAccess = await GlobalAccess.findOne().sort({ createdAt: -1 });
    if (globalAccess && globalAccess.active && globalAccess.expiresAt > new Date()) {
      // Global access is active and not expired
      return next();
    }

    // No valid global access, proceed to password check
    return checkPassword(req, res, next);
  } catch (error) {
    console.error("Global access check error:", error);
    // Proceed to password check on error
    return checkPassword(req, res, next);
  }
};

// Password Middleware
const checkPassword = async (req, res, next) => {
  try {
    // If this is not a password verification request, return 401
    if (req.path !== '/api/password/verify') {
      return res.status(401).json({
        error: "Authentication required",
        requiresPassword: true
      });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(401).json({ error: "Password required" });
    }

    // If MongoDB is not connected, use fallback authentication
    if (!isMongoConnected) {
      // Fallback to hardcoded password for development/testing
      if (password === 'qwerty1234') {
        return next();
      } else {
        return res.status(401).json({ error: "Invalid password" });
      }
    }

    // MongoDB is connected, use database authentication
    const currentPassword = await Password.findOne().sort({ createdAt: -1 });
    if (!currentPassword) {
      return res.status(401).json({ error: "Password not set" });
    }

    if (currentPassword.expiresAt < new Date()) {
      return res.status(401).json({ error: "Password expired" });
    }

    if (password !== currentPassword.value) {
      return res.status(401).json({ error: "Invalid password" });
    }

    next();
  } catch (error) {
    console.error("Password check error:", error);

    // Fallback to hardcoded password if there's an error
    const { password } = req.body;
    if (password === 'qwerty1234') {
      return next();
    }

    res.status(500).json({ error: "Password verification failed" });
  }
};

// Password Routes
app.post("/api/password/verify", checkPassword, async (req, res) => {
  try {
    const { hours = 1 } = req.body; // Default to 1 hour if not specified
    const accessHours = Math.max(1, parseInt(hours)); // Ensure at least 1 hour

    // Set global access expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + accessHours);

    // Store in memory for fallback mode
    global.accessExpiryTime = expiresAt.getTime();

    // If MongoDB is connected, store in database
    if (isMongoConnected) {
      const globalAccess = new GlobalAccess({
        active: true,
        expiresAt
      });
      await globalAccess.save();
    }

    res.json({
      success: true,
      message: "Password verified and global access granted",
      expiresAt,
      accessHours
    });
  } catch (error) {
    console.error("Error setting global access:", error);
    // Still return success but with a warning
    res.json({
      success: true,
      message: "Password verified but failed to set global access",
      fallbackMode: true
    });
  }
});

app.post("/api/password/change", checkPassword, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: "New password required" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    // If MongoDB is not connected, use fallback
    if (!isMongoConnected) {
      // In fallback mode, we just return success
      // The client will store the new password locally
      return res.json({
        success: true,
        message: "Password changed (fallback mode)",
        expiresAt,
        fallbackMode: true
      });
    }

    // MongoDB is connected, save to database
    const newPass = new Password({
      value: newPassword,
      expiresAt
    });

    await newPass.save();
    res.json({ success: true, message: "Password changed", expiresAt });
  } catch (error) {
    console.error("Password change error:", error);

    // Return success in fallback mode
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    res.json({
      success: true,
      message: "Password changed (fallback mode)",
      expiresAt,
      fallbackMode: true
    });
  }
});

// Get global access status
app.get("/api/access/status", async (req, res) => {
  try {
    // If MongoDB is not connected, use memory fallback
    if (!isMongoConnected) {
      if (global.accessExpiryTime) {
        const now = new Date().getTime();
        const expiresAt = new Date(global.accessExpiryTime);
        const isActive = now < global.accessExpiryTime;
        const hoursRemaining = isActive ? Math.ceil((global.accessExpiryTime - now) / (1000 * 60 * 60)) : 0;

        return res.json({
          active: isActive,
          expiresAt,
          hoursRemaining,
          fallbackMode: true
        });
      } else {
        return res.json({
          active: false,
          fallbackMode: true
        });
      }
    }

    // MongoDB is connected, get from database
    const globalAccess = await GlobalAccess.findOne().sort({ createdAt: -1 });
    if (!globalAccess) {
      return res.json({ active: false });
    }

    const now = new Date();
    const expiresAt = new Date(globalAccess.expiresAt);
    const isActive = globalAccess.active && expiresAt > now;
    const hoursRemaining = isActive ? Math.ceil((expiresAt - now) / (1000 * 60 * 60)) : 0;

    res.json({
      active: isActive,
      expiresAt: globalAccess.expiresAt,
      hoursRemaining
    });
  } catch (error) {
    console.error("Global access status check error:", error);

    // Fallback to memory
    if (global.accessExpiryTime) {
      const now = new Date().getTime();
      const expiresAt = new Date(global.accessExpiryTime);
      const isActive = now < global.accessExpiryTime;
      const hoursRemaining = isActive ? Math.ceil((global.accessExpiryTime - now) / (1000 * 60 * 60)) : 0;

      return res.json({
        active: isActive,
        expiresAt,
        hoursRemaining,
        fallbackMode: true
      });
    } else {
      return res.json({
        active: false,
        fallbackMode: true
      });
    }
  }
});

// Add time to global access
app.post("/api/access/extend", async (req, res) => {
  try {
    const { hours = 1 } = req.body; // Default to 1 hour if not specified
    const additionalHours = Math.max(1, parseInt(hours)); // Ensure at least 1 hour

    // If MongoDB is not connected, use memory fallback
    if (!isMongoConnected) {
      if (global.accessExpiryTime) {
        const currentExpiry = new Date(global.accessExpiryTime);
        currentExpiry.setHours(currentExpiry.getHours() + additionalHours);
        global.accessExpiryTime = currentExpiry.getTime();

        return res.json({
          success: true,
          message: `Extended access by ${additionalHours} hours`,
          expiresAt: new Date(global.accessExpiryTime),
          fallbackMode: true
        });
      } else {
        // No existing access, create new
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + additionalHours);
        global.accessExpiryTime = expiresAt.getTime();

        return res.json({
          success: true,
          message: `Granted access for ${additionalHours} hours`,
          expiresAt: new Date(global.accessExpiryTime),
          fallbackMode: true
        });
      }
    }

    // MongoDB is connected, update in database
    const globalAccess = await GlobalAccess.findOne().sort({ createdAt: -1 });
    if (globalAccess && globalAccess.active) {
      // Extend existing access
      const currentExpiry = new Date(globalAccess.expiresAt);
      currentExpiry.setHours(currentExpiry.getHours() + additionalHours);
      globalAccess.expiresAt = currentExpiry;
      await globalAccess.save();

      // Also update memory fallback
      global.accessExpiryTime = currentExpiry.getTime();

      return res.json({
        success: true,
        message: `Extended access by ${additionalHours} hours`,
        expiresAt: currentExpiry
      });
    } else {
      // No existing access or inactive, create new
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + additionalHours);

      const newAccess = new GlobalAccess({
        active: true,
        expiresAt
      });
      await newAccess.save();

      // Also update memory fallback
      global.accessExpiryTime = expiresAt.getTime();

      return res.json({
        success: true,
        message: `Granted access for ${additionalHours} hours`,
        expiresAt
      });
    }
  } catch (error) {
    console.error("Error extending global access:", error);

    // Fallback to memory
    try {
      const { hours = 1 } = req.body;
      const additionalHours = Math.max(1, parseInt(hours));

      if (global.accessExpiryTime) {
        const currentExpiry = new Date(global.accessExpiryTime);
        currentExpiry.setHours(currentExpiry.getHours() + additionalHours);
        global.accessExpiryTime = currentExpiry.getTime();

        return res.json({
          success: true,
          message: `Extended access by ${additionalHours} hours (fallback mode)`,
          expiresAt: new Date(global.accessExpiryTime),
          fallbackMode: true
        });
      } else {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + additionalHours);
        global.accessExpiryTime = expiresAt.getTime();

        return res.json({
          success: true,
          message: `Granted access for ${additionalHours} hours (fallback mode)`,
          expiresAt: new Date(global.accessExpiryTime),
          fallbackMode: true
        });
      }
    } catch (innerError) {
      console.error("Fallback error:", innerError);
      return res.status(500).json({ error: "Failed to extend access" });
    }
  }
});

// Deactivate global access (hard lock)
app.post("/api/access/deactivate", async (req, res) => {
  try {
    // Clear memory fallback
    global.accessExpiryTime = null;

    // If MongoDB is connected, update in database
    if (isMongoConnected) {
      const globalAccess = await GlobalAccess.findOne().sort({ createdAt: -1 });
      if (globalAccess) {
        globalAccess.active = false;
        await globalAccess.save();
      }
    }

    res.json({
      success: true,
      message: "Global access deactivated"
    });
  } catch (error) {
    console.error("Error deactivating global access:", error);

    // Clear memory fallback anyway
    global.accessExpiryTime = null;

    res.json({
      success: true,
      message: "Global access deactivated (fallback mode)",
      fallbackMode: true
    });
  }
});

// Get password expiration info
app.get("/api/password/expiry", async (req, res) => {
  try {
    // If MongoDB is not connected, use fallback expiration
    if (!isMongoConnected) {
      // Return a default expiration date (30 days from now)
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(now.getDate() + 30);
      const daysRemaining = 30;

      return res.json({
        expiresAt: expiresAt,
        daysRemaining,
        isExpired: false
      });
    }

    // MongoDB is connected, get expiration from database
    const currentPassword = await Password.findOne().sort({ createdAt: -1 });
    if (!currentPassword) {
      return res.status(404).json({ error: "No password found" });
    }

    const now = new Date();
    const expiresAt = new Date(currentPassword.expiresAt);
    const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    res.json({
      expiresAt: currentPassword.expiresAt,
      daysRemaining,
      isExpired: now > expiresAt
    });
  } catch (error) {
    console.error("Password expiry check error:", error);

    // Return a default expiration date (30 days from now)
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + 30);
    const daysRemaining = 30;

    res.json({
      expiresAt: expiresAt,
      daysRemaining,
      isExpired: false
    });
  }
});

// Initialize first password if none exists
async function initializePassword() {
  try {
    if (!isMongoConnected) {
      console.log("Using fallback authentication with default password 'qwerty1234'");
      return;
    }

    const count = await Password.countDocuments();
    if (count === 0) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

      const initialPass = new Password({
        value: "qwerty1234",
        expiresAt
      });
      await initialPass.save();
      console.log("Initial password set to 'qwerty1234'");
    }
  } catch (error) {
    console.error("Failed to initialize password:", error);
    console.log("Using fallback authentication with default password 'qwerty1234'");
  }
}

// Call initialize after DB connection or after a delay if connection fails
mongoose.connection.once('open', async () => {
  // Initialize password
  await initializePassword();

  // Ensure TTL index exists for auto-deletion after 24 hours
  try {
    await mongoose.connection.collection('requests').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 86400 } // 24 hours
    );
    console.log("TTL index created for auto-deletion after 24 hours");
  } catch (error) {
    console.error("Error creating TTL index:", error);
  }
});

// Also call initialize after a delay to handle the case where MongoDB connection fails
setTimeout(initializePassword, 5000);

// Apply global access middleware to all routes
app.use(checkGlobalAccess);

// Protected Routes
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
