// Import required modules
import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import "reflect-metadata";
import { runSeeds } from './infrastructure/database/seeds';

// Load environment variables from .env file
dotenv.config();

// Import database connection
import { initializeDatabase } from "./infrastructure/database/connection";

// Import routes
import routeRoutes from "./adapters/inbound/http/routes/route.routes";
import complianceRoutes from "./adapters/inbound/http/routes/compliance.routes";
import bankingRoutes from "./adapters/inbound/http/routes/banking.routes";
import poolingRoutes from "./adapters/inbound/http/routes/pooling.routes";

// Import error handler
import { errorHandler } from "./adapters/inbound/http/middlewares/errorHandler.middleware";

// Create an Express application
const app: Application = express();

// Middleware
app.use(cors()); // Enable Cross-Origin requests
app.use(express.json()); // Parse JSON request bodies

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "FuelEU Maritime API is running",
    timestamp: new Date().toISOString(),
  });
});

// Default route - API documentation
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "FuelEU Maritime Compliance API",
    version: "1.0.0",
    message: " Backend is running!",
    endpoints: {
      routes: "/api/routes",
      compliance: "/api/compliance",
      banking: "/api/banking",
      pools: "/api/pools",
    },
    health: "/health",
  });
});

// API Routes
app.use("/api/routes", routeRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/banking", bankingRoutes);
app.use("/api/pools", poolingRoutes);

// Error handling middleware (must be last!)
app.use(errorHandler);

// 404 handler - route not found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Server port from environment or default
const PORT = process.env.PORT || 4000;

/**
 * Start the server
 * Step 1: Connect to database
 * Step 2: Start Express server
 */
const startServer = async () => {
  try {
    // Connect to PostgreSQL database
    await initializeDatabase();
    
    // Seed database with initial data (only runs if empty)
    await runSeeds(); 

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API docs: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1); // Exit if server can't start
  }
};

// Start the application
startServer();

// Export for testing
export default app;