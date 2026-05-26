import {
  type Submission, type InsertSubmission, submissions
} from "../shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const sql = neon(databaseUrl);
  return drizzle(sql);
}

// Create tables on first use
async function ensureTables() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const sql = neon(databaseUrl);
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
}

let tablesEnsured = false;

export interface IStorage {
  createSubmission(data: InsertSubmission): Promise<Submission>;
  getSubmissions(): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
}

export class DatabaseStorage implements IStorage {
  private async init() {
    if (!tablesEnsured) {
      await ensureTables();
      tablesEnsured = true;
    }
  }

  async createSubmission(data: InsertSubmission): Promise<Submission> {
    await this.init();
    const db = getDb();
    const rows = await db.insert(submissions).values(data).returning();
    return rows[0];
  }

  async getSubmissions(): Promise<Submission[]> {
    await this.init();
    const db = getDb();
    return db.select().from(submissions).orderBy(desc(submissions.createdAt));
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    await this.init();
    const db = getDb();
    const rows = await db.select().from(submissions).where(eq(submissions.id, id));
    return rows[0];
  }
}

export const storage = new DatabaseStorage();
