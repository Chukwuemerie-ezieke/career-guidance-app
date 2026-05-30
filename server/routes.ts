import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema } from "../shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {


  const JWT_SECRET = process.env.JWT_SECRET || process.env.REPL_ID || "career-guidance-secret";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  // Middleware to ensure authentication for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    import("jsonwebtoken").then((jwt) => {
      const token = req.signedCookies.auth_token;
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      try {
        jwt.verify(token, JWT_SECRET);
        next();
      } catch (err) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    });
  };

  // Save a student submission
  app.post("/api/submissions", async (req, res) => {
    try {
      const data = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission({
        firstName: data.firstName,
        studentClass: data.studentClass,
        strongestSubjects: data.strongestSubjects,
        interests: data.interests,
        universityType: data.universityType,
        preferredState: data.preferredState,
        gradeRange: data.gradeRange,
        recommendations: data.recommendations,

      });
      res.json(submission);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get all submissions (for counsellor dashboard)
  app.get("/api/submissions", requireAuth, async (_req, res) => {
    try {
      const all = await storage.getSubmissions();
      res.json(all);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single submission
  app.get("/api/submissions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const submission = await storage.getSubmission(id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      res.json(submission);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });




  // Delete submission
  app.delete("/api/submissions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSubmission(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const jwt = await import("jsonwebtoken");
      const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
      res.cookie("auth_token", token, {
        httpOnly: true,
        signed: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.json({ message: "Logged in" });
    }
    return res.status(401).json({ error: "Invalid password" });
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/user", requireAuth, (req, res) => {
    res.json({ role: "admin" });
  });

  return httpServer;
}
