const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config({ path: "./config/.env" });

// Check for required environment variables
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars);
  console.error(
    "Please check your ./config/.env file and ensure it contains all required keys."
  );
  process.exit(1);
}

// Connect to database
console.log("Connecting to MongoDB...");
connectDB();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      // Add your Render frontend URL here after deployment
      process.env.FRONTEND_URL || "https://your-frontend-app.onrender.com",
    ],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// --- API ROUTES ---

try {
  console.log("Loading users routes...");
  app.use("/api/users", require("./routes/users"));
  console.log("✅ Users routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading users routes:", error.message);
  process.exit(1);
}

try {
  console.log("Loading events routes...");
  app.use("/api/events", require("./routes/events"));
  console.log("✅ Events routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading events routes:", error.message);
  process.exit(1);
}

try {
  console.log("Loading photos routes...");
  app.use("/api/photos", require("./routes/photos"));
  console.log("✅ Photos routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading photos routes:", error.message);
  process.exit(1);
}

// --- ADD THIS BLOCK ---
try {
  console.log("Loading comments routes...");
  app.use("/api/comments", require("./routes/comments"));
  console.log("✅ Comments routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading comments routes:", error.message);
  process.exit(1);
}

try {
  console.log("Loading groups routes...");
  app.use("/api/groups", require("./routes/groups"));
  console.log("✅ Groups routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading groups routes:", error.message);
  process.exit(1);
}
// --- END ADD ---

// --- STATIC ASSETS ---
const clientPath = path.join(__dirname, "../client/dist");
console.log("Serving static files from:", clientPath);

if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  console.log("✅ Static files configured");
} else {
  console.warn(
    "⚠️  Client build directory not found. Run 'npm run build' in the /client folder."
  );
}

// Catch-all handler for React Router
app.get(/^(?!\/api).*/, (req, res) => {
  const indexPath = path.resolve(__dirname, "../client/dist", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      error: "Client build not found.",
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    error: "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
