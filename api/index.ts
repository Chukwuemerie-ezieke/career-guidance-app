import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Promise to track when routes are ready
let routesReady: Promise<void> | null = null;

function ensureRoutes() {
  if (!routesReady) {
    routesReady = registerRoutes(httpServer, app).then(() => {
      // Error handler — must be added after routes
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error("API Error:", err);
        if (!res.headersSent) {
          res.status(status).json({ message });
        }
      });
    });
  }
  return routesReady;
}

// Vercel serverless handler
export default async function handler(req: any, res: any) {
  try {
    await ensureRoutes();
    return app(req, res);
  } catch (error: any) {
    console.error("Handler error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}
