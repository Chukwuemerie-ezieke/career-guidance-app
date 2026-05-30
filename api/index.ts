import type { VercelRequest, VercelResponse } from "@vercel/node";

let handler: ((req: VercelRequest, res: VercelResponse) => Promise<VercelResponse>) | null = null;

async function createHandler() {
  const { insertSubmissionSchema } = await import("../shared/schema");
  const { ZodError } = await import("zod");
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const { pgTable, text, serial, timestamp } = await import("drizzle-orm/pg-core");
  const { sql } = await import("drizzle-orm");
  const { eq, desc } = await import("drizzle-orm");

  const submissions = pgTable("submissions", {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    studentClass: text("student_class").notNull(),
    strongestSubjects: text("strongest_subjects").notNull(),
    interests: text("interests").notNull(),
    universityType: text("university_type").notNull(),
    preferredState: text("preferred_state").notNull(),
    gradeRange: text("grade_range").notNull(),
    recommendations: text("recommendations").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  });

  function getDb() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");
    return drizzle(neon(url));
  }

  let tablesReady = false;
  async function ensureTables() {
    if (tablesReady) return;
    const sql = neon(process.env.DATABASE_URL!);
    await sql(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        student_class TEXT NOT NULL,
        strongest_subjects TEXT NOT NULL,
        interests TEXT NOT NULL,
        university_type TEXT NOT NULL,
        preferred_state TEXT NOT NULL,
        grade_range TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    tablesReady = true;
  }

  return async (req: VercelRequest, res: VercelResponse) => {
    await ensureTables();
    const db = getDb();
    const url = req.url || "";
    const method = req.method || "GET";

    const JWT_SECRET = process.env.JWT_SECRET || process.env.REPL_ID || "career-guidance-secret";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

    // Use Vercel's built-in parsed cookies
    let rawToken = req.cookies.auth_token;
    if (rawToken && rawToken.startsWith('s:')) {
      const cookieParser = await import('cookie-parser');
      rawToken = cookieParser.signedCookie(rawToken, JWT_SECRET) as string;
    }

    const isAuthenticated = async () => {
      if (!rawToken) return false;
      try {
        const jwt = await import("jsonwebtoken");
        jwt.verify(rawToken, JWT_SECRET);
        return true;
      } catch (e) {
        return false;
      }
    };

    // GET /api/submissions
    if (method === "GET" && (url === "/api/submissions" || url === "/api" || url === "/api/")) {
      if (!(await isAuthenticated())) return res.status(401).json({ error: "Unauthorized" });
      const all = await db.select().from(submissions).orderBy(desc(submissions.createdAt));
      return res.json(all);
    }

    // GET /api/submissions/:id
    const idMatch = url.match(/\/api\/submissions\/(\d+)/);
    if (method === "GET" && idMatch) {
      if (!(await isAuthenticated())) return res.status(401).json({ error: "Unauthorized" });
      const id = parseInt(idMatch[1]);
      const rows = await db.select().from(submissions).where(eq(submissions.id, id));
      if (!rows[0]) return res.status(404).json({ error: "Not found" });
      return res.json(rows[0]);
    }


    // DELETE /api/submissions/:id
    if (method === "DELETE" && idMatch) {
      if (!(await isAuthenticated())) return res.status(401).json({ error: "Unauthorized" });
      const id = parseInt(idMatch[1]);
      await db.delete(submissions).where(eq(submissions.id, id));
      return res.json({ success: true });
    }

    // POST /api/submissions
    if (method === "POST" && (url === "/api/submissions" || url === "/api" || url === "/api/")) {
      try {
        const data = insertSubmissionSchema.parse(req.body);
        const rows = await db.insert(submissions).values({
          firstName: data.firstName,
          studentClass: data.studentClass,
          strongestSubjects: data.strongestSubjects,
          interests: data.interests,
          universityType: data.universityType,
          preferredState: data.preferredState,
          gradeRange: data.gradeRange,
          recommendations: data.recommendations,

        }).returning();
        return res.json(rows[0]);
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({ error: "Validation failed", details: err.errors });
        }
        throw err;
      }
    }


    // POST /api/login
    if (method === "POST" && url === "/api/login") {
      const { password } = req.body;
      if (password === ADMIN_PASSWORD) {
        const jwt = await import("jsonwebtoken");
        const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });

        // Express cookie-parser signed format: s:VALUE.SIGNATURE
        const crypto = await import("crypto");
        const signature = crypto.createHmac("sha256", JWT_SECRET).update(token).digest("base64").replace(/\=+$/, '');
        const signedToken = `s:${token}.${signature}`;

        res.setHeader('Set-Cookie', `auth_token=${encodeURIComponent(signedToken)}; HttpOnly; Max-Age=86400; Path=/`);
        return res.json({ message: "Logged in" });
      }
      return res.status(401).json({ error: "Invalid password" });
    }

    // GET /api/user
    if (method === "GET" && url === "/api/user") {
      if (!(await isAuthenticated())) return res.status(401).json({ error: "Unauthorized" });
      return res.json({ role: "admin" });
    }

    // Health check
    if (url.startsWith("/api/health")) {
      return res.json({ status: "ok" });
    }

    return res.status(404).json({ error: "Not found" });
  };
}

export default async function main(req: VercelRequest, res: VercelResponse) {
  try {
    if (!handler) {
      handler = await createHandler();
    }
    await handler!(req, res);
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
