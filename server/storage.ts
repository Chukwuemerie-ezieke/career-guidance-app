import {
  type User, type InsertUser, users,
  type Submission, type InsertSubmission, submissions
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSubmission(data: InsertSubmission): Promise<Submission>;
  getSubmissions(): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        student_class TEXT NOT NULL,
        strongest_subjects TEXT NOT NULL,
        interests TEXT NOT NULL,
        university_type TEXT NOT NULL,
        preferred_state TEXT NOT NULL,
        grade_range TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  async getUser(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return db.insert(users).values(insertUser).returning().get();
  }

  async createSubmission(data: InsertSubmission): Promise<Submission> {
    return db.insert(submissions).values(data).returning().get();
  }

  async getSubmissions(): Promise<Submission[]> {
    return db.select().from(submissions).orderBy(desc(submissions.createdAt)).all();
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    return db.select().from(submissions).where(eq(submissions.id, id)).get();
  }
}

export const storage = new DatabaseStorage();
