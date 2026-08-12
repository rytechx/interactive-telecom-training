# TeleSim 3D

TeleSim 3D is an interactive telecommunications training application with a React student portal, a browser-based 3D laboratory, guided practical modules, assessments, persistent MySQL-backed training records, and a role-protected instructor analytics portal.

## Current Modules

- RJ45 Cable Termination v1.0
- Fiber Optic Fusion Splicing v1.0
- Network Device Installation and Troubleshooting v1.0
- IPv4 configuration and router/switch CLI simulation
- Six network troubleshooting scenarios with assessment scoring

## Technology Stack

### Frontend

- React 19 and Vite 8
- JavaScript and JSX
- React Router and Zustand
- Three.js, React Three Fiber, Drei, and React Three Rapier

### Backend

- Node.js and Express
- MySQL through `mysql2/promise`
- bcrypt password hashing
- JWT sessions stored in HTTP-only cookies
- CORS restricted to the configured frontend origin

## Local Development Setup

### 1. Install frontend dependencies

From the project root:

```bash
npm install
```

### 2. Start XAMPP MySQL

Open the XAMPP Control Panel and start the MySQL service. Apache is optional for the Vite and Express development workflow.

### 3. Create the database schema

Open phpMyAdmin or another MySQL client and execute:

```text
server/sql/schema.sql
```

The script creates the `telesim3d` database, authentication and training-result tables, and the three training-module records.

For an existing database with registered students, do not delete or reimport the database. Run the safe migration from `server/` instead:

```bash
npm run migrate
```

This applies the numbered migrations in `server/sql/`, including the training-result tables and the nullable staff `student_number` refinement. The migrations preserve existing users and attempts and can be run again safely.

### 4. Configure the API environment

Copy:

```text
server/.env.example
```

to:

```text
server/.env
```

Configure the MySQL username and password used by your XAMPP installation. Do not assume the MySQL root password is blank. Set `JWT_SECRET` to a long random value that is not committed to source control.

Required API variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | Express API port; defaults to `3001` |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name; use `telesim3d` |
| `JWT_SECRET` | Secret used to sign session tokens |
| `JWT_EXPIRES_IN` | Session lifetime such as `8h` |
| `CLIENT_ORIGIN` | Exact Vite origin allowed by CORS |

### 5. Install and start the API

```bash
cd server
npm install
npm run dev
```

Successful startup reports:

```text
MySQL connection successful
TeleSim API running on port 3001
```

### 6. Configure the frontend API URL

Copy the root `.env.example` to `.env` when the default API address needs to be configured explicitly:

```text
VITE_API_URL=http://localhost:3001/api
```

### 7. Start the frontend

In a separate terminal from the project root:

```bash
npm run dev
```

Use the exact Vite origin configured in `CLIENT_ORIGIN`. Authentication cookies are HTTP-only and are never stored or managed by frontend JavaScript.

### Create a development staff account

Public registration always creates a `student`. Bootstrap the first administrator through the controlled server-side utility. From `server/`, keep the password in a temporary environment variable and pass non-secret identity fields as command options:

```powershell
$env:STAFF_PASSWORD = 'use-a-unique-long-password'
npm run create-staff -- --role=admin --first-name=Your --last-name=Name --email=your-address@example.test
Remove-Item Env:STAFF_PASSWORD
```

The utility also accepts `STAFF_FIRST_NAME`, `STAFF_LAST_NAME`, `STAFF_EMAIL`, and `STAFF_ROLE` environment values when command options are not supplied. It accepts only `instructor` or `admin`, requires a password of at least 12 characters, hashes it with the shared bcrypt service, creates no fake student number, and refuses to replace an existing account. Values above are placeholders, not application credentials. Do not add staff passwords to `.env`, command history, source code, or version control. After the first administrator signs in at `/staff/login`, additional staff accounts can be created from User Management.

## Development Commands

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Lint frontend and backend source files |
| `npm run build` | Create the production frontend bundle |
| `npm run preview` | Preview the production frontend bundle |

### Backend

Run these commands from `server/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Node watch mode |
| `npm start` | Start the API normally |
| `npm run migrate` | Apply all numbered non-destructive database migrations |
| `npm run create-staff` | Bootstrap one controlled instructor/admin account |
| `npm run create:staff` | Backward-compatible alias for `create-staff` |
| `npm test` | Run backend validation tests |

## Authentication API

All API responses use a consistent `success` field. Authentication requests that use the session cookie must include credentials.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Check API availability |
| `POST` | `/api/auth/register` | Public | Create a student account |
| `POST` | `/api/auth/login` | Public | Sign in a student by email or student number |
| `POST` | `/api/auth/staff/login` | Public | Sign in an instructor or administrator by email |
| `GET` | `/api/auth/me` | Authenticated | Return the safe current-user profile |
| `POST` | `/api/auth/logout` | Public | Clear the authentication cookie |

Passwords are hashed with bcrypt and are never returned through the API. The server assigns the `student` role during public registration; client-provided role values are ignored. The staff endpoint rejects student accounts, while the student endpoint directs valid staff accounts to the Staff Portal.

## Role Architecture

- `student` accounts use the existing Dashboard, Training, Laboratory, Results, Profile, and Settings routes. Student training APIs remain self-only.
- `instructor` accounts can read student educational records and aggregate training analytics.
- `admin` accounts share the instructor analytics portal and can manage account roles and active status from User Management.
- Administrators can create instructor or administrator accounts; there is no public staff registration route.
- Every instructor endpoint runs both `authenticate` and `authorize('instructor', 'admin')`. The React role guard improves navigation only; it is not the security boundary.
- Instructor analytics remain read-only. Admin mutations affect only `users.role` and `users.is_active`; they never edit training results or delete history.
- Admin mutations run an additional `authorize('admin')` check. Administrators cannot change their own role or deactivate their current account.

## Training Results API

Every training endpoint requires the verified HTTP-only session and only returns the current student's records.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/training/attempts` | Start a numbered module attempt |
| `POST` | `/api/training/attempts/:attemptId/complete` | Save one final module assessment |
| `POST` | `/api/training/attempts/:attemptId/scenarios` | Save one Network scenario result |
| `GET` | `/api/training/progress` | Load persisted Dashboard progress |
| `GET` | `/api/training/attempts` | Load filtered attempt history |
| `GET` | `/api/training/attempts/:attemptId` | Load owned attempt metrics and scenarios |

Dashboard Average Score is the rounded average of each completed module's best score. Latest and best scores are derived from immutable historical attempts.

## Instructor Analytics API

All endpoints require an active `instructor` or `admin` session. List endpoints use validated server-side pagination with limits of 20 or 50 records.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/instructor/overview` | Headline counts, status breakdown, module completion, and recent activity |
| `GET` | `/api/instructor/students` | Search and filter paginated safe student records |
| `GET` | `/api/instructor/students/:studentId` | Safe student profile and aggregated module progress |
| `GET` | `/api/instructor/students/:studentId/attempts` | Paginated historical attempts for one student |
| `GET` | `/api/instructor/students/:studentId/attempts/:attemptId` | Stored module metrics and Network scenario details |
| `GET` | `/api/instructor/modules` | Module participation, score distribution, duration, and diagnostic metrics |
| `GET` | `/api/instructor/results` | Filtered completed attempts across students |
| `GET` | `/api/instructor/troubleshooting` | Six-scenario performance and difficulty ranking |
| `GET` | `/api/instructor/users` | Admin-only paginated account list with search, role, and status filters |
| `POST` | `/api/instructor/users/staff` | Admin-only instructor or administrator account creation |
| `PATCH` | `/api/instructor/users/:userId/role` | Admin-only validated role change |
| `PATCH` | `/api/instructor/users/:userId/status` | Admin-only account activation or deactivation |

Student status uses an intentionally small policy: no attempts is **Not Started**; activity without all modules is **In Progress**; all active modules completed is **Completed**; and any completed module whose best score is below 70 is **Needs Practice**. Needs Practice takes precedence over Completed in the status breakdown. Average Overall Score is calculated from each student's average of best completed module scores.

Module diagnostics read stored `metrics_json` in the backend and safely ignore missing legacy metrics. The implementation avoids version-specific MySQL JSON aggregation functions so it remains compatible with the current XAMPP MySQL/MariaDB workflow.

## Protected Frontend Routes

Student-only routes:

- `/` - Student Dashboard
- `/training` - Training Modules
- `/lab` - 3D Telecom Laboratory
- `/results` - Persistent Training Results
- `/profile` - Read-only Student Profile
- `/settings` - Student application settings

Instructor/admin routes:

- `/instructor` - Management overview
- `/instructor/students` - Student records
- `/instructor/students/:studentId` - Student detail and attempt history
- `/instructor/modules` - Module analytics
- `/instructor/results` - Cross-student result history
- `/instructor/troubleshooting` - Scenario analytics
- `/instructor/users` - Admin-only user management
- `/instructor/profile` - Staff profile

Public routes:

- `/login` - Student login
- `/staff/login` - Instructor and administrator login
- `/register` - Student registration only

Unauthenticated student-route visits redirect to `/login`; unauthenticated management-route visits redirect to `/staff/login`. Authenticated visits to public authentication routes redirect by role: students to `/`, and instructors/admins to `/instructor`. Role-mismatched visits show the Access Restricted route or redirect to the correct role home. Student logout returns to `/login`, while staff logout returns to `/staff/login`.

## Database Structure

### `users`

Stores account identity, a bcrypt password hash, a server-controlled role, active status, and timestamps. `student_number` remains unique and required by student registration but is nullable for instructor and administrator accounts. Staff accounts use their unique email identity and do not receive invented student numbers. Migration `003_staff_accounts.sql` makes this change without deleting or rewriting existing accounts.

### Training result persistence

- `training_modules` contains the seeded RJ45, Fiber, and Network modules.
- `training_attempts` stores numbered attempts, final scores, accuracy, duration, rating, timestamps, and sanitized module metrics.
- `network_scenario_results` stores the six troubleshooting scenario assessments under their owning Network attempt.

## Security Notes

- SQL calls use parameterized queries.
- Session JWTs contain only the user ID and role.
- Authorization reloads the active user and role from MySQL.
- Instructor routes require the server-verified `instructor` or `admin` role and expose no password, cookie, or JWT fields.
- Instructor analytics use parameterized filters and read-only queries; student-owned endpoints remain isolated by user ID.
- Admin account mutations accept only `student`, `instructor`, or `admin` roles and explicit boolean status values.
- Staff creation accepts only `instructor` or `admin`, validates unique email and a 12-character minimum password, and stores only the bcrypt hash.
- Deactivation is a reversible `is_active` update. Foreign-key training history remains untouched, and inactive sessions are rejected on their next authenticated request.
- The JWT is stored in the `telesim_session` HTTP-only cookie.
- Cookies use `SameSite=Lax` and become secure automatically in production.
- CORS never uses a wildcard when credentials are enabled.
- `.env` files and backend dependencies are excluded from Git.

## Laboratory Controls

| Input | Action |
| --- | --- |
| Click canvas | Activate pointer lock and mouse look |
| Mouse | Look around |
| `W` / `A` / `S` / `D` | Move through the laboratory |
| `Shift` | Run while moving |
| `E` | Interact with an available workstation |
| `Escape` | Release pointer lock or exit a focused view |

## Current Limitations

- MySQL credentials and a JWT secret must be configured locally before authentication can run.
- In-progress attempts may remain when a student exits before completion; a later Begin Training action safely creates a new attempt.
- Password reset, profile editing, permanent account deletion, and training-result editing are not included in this sprint.
- Analytics must be compared with the corresponding local records in phpMyAdmin before being treated as production-verified. The optional database integration suite can seed and remove isolated test students with `RUN_DB_INTEGRATION=1 npm test`.
- The production build still reports non-blocking large-chunk warnings for the 3D and physics bundles.

## Documentation

- [Technical Design Specification](docs/TECHNICAL_DESIGN_SPECIFICATION.md)
- [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Coding Standards](docs/CODING_STANDARDS.md)
- [Testing Checklist](docs/TESTING_CHECKLIST.md)
