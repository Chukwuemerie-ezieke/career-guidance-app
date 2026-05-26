# Security Review & Recommendations

Based on my review of the codebase, here are the critical security updates and improvements recommended for this application:

### 1. Lack of Authentication & Authorization (Data Leak)
* **The Issue:** The `/api/submissions` GET endpoint and the `/dashboard` frontend route are completely public. Anyone who navigates to the dashboard can view all student submissions, which includes sensitive PII (student names, classes, grades, and interests).
* **Recommendation:** While `passport`, `passport-local`, and `express-session` are present in `package.json`, and a `users` table is defined in `shared/schema.ts`, they aren't fully implemented. Implement login routes and add an authentication middleware to protect the `/api/submissions` GET endpoint so only authorized counsellors can access it.

### 2. Missing Server-Side Input Validation
* **The Issue:** In `server/routes.ts`, the `POST /api/submissions` endpoint takes `req.body` and inserts it directly into the database without validation.
* **Recommendation:** Malicious users could send unexpected fields or malformed data. You already have Zod schemas like `insertSubmissionSchema` and `studentFormSchema` in `shared/schema.ts`. Use them to safely parse and validate `req.body` before saving to the database.

### 3. Vulnerable Dependencies (SQL Injection)
* **The Issue:** Running `npm audit` reveals 5 high-severity vulnerabilities. Most notably, the app uses an older version of `drizzle-orm` (`^0.39.3`) which is susceptible to **SQL injection** via improperly escaped SQL identifiers.
* **Recommendation:** Run `npm audit fix` and specifically upgrade `drizzle-orm` to a safe version (`>=0.45.2`).

### 4. Plaintext Passwords in the Database
* **The Issue:** In `server/storage.ts`, the `createUser` method inserts user accounts directly into the database in plain text.
* **Recommendation:** Before finalizing the counsellor login feature, install a hashing library like `bcrypt` or `argon2`. Always hash the password before saving it to the database, and verify against the hash during login.

### 5. Sensitive Information Leakage in Logs
* **The Issue:** In `server/index.ts`, custom middleware captures and logs the entire JSON response of every API call: `logLine += \` :: ${JSON.stringify(capturedJsonResponse)}\`;`
* **Recommendation:** This logs PII to your server's standard output. Remove `capturedJsonResponse` from the logs, keeping only the method, path, status code, and duration.

### 6. No Rate Limiting (DoS Risk)
* **The Issue:** There is no protection against spam submissions. A bot could easily hit the `/api/submissions` endpoint thousands of times.
* **Recommendation:** Install `express-rate-limit` and apply it to the `POST /api/submissions` route to restrict the number of submissions allowed from a single IP address.

### 7. Missing Basic HTTP Security Headers
* **The Issue:** Express does not enable secure HTTP headers by default.
* **Recommendation:** Install the `helmet` package and add `app.use(helmet())` to your Express app configuration in `server/index.ts` to protect against common web vulnerabilities.
