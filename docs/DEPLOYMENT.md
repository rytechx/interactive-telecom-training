# TeleSim 3D Deployment Guide

This guide prepares the React/Vite frontend, Node/Express API, and MySQL database for a provider-neutral production deployment. It does not represent evidence that a production deployment has been completed.

## 1. Choose a Domain Architecture

Use one of these environment-driven layouts:

- **Same origin:** frontend at `https://training.example` and API reverse-proxied under `https://training.example/api`.
- **API subdomain:** frontend at `https://training.example` and API at `https://api.training.example/api`.

Do not hard-code either hostname in source. Set `VITE_API_URL` at frontend build time and `CLIENT_ORIGIN` in the backend environment. The production frontend defaults to same-origin `/api` when `VITE_API_URL` is omitted.

## 2. Provision MySQL

1. Create an empty UTF-8 database through the hosting platform.
2. Create a dedicated application database user with access only to that database.
3. Configure the backend `DB_*` variables through the provider's secret/environment system.
4. From the deployed `server` directory, run `npm run migrate` once and after future schema releases.

The migration runner applies this order:

1. `server/sql/schema.sql`
2. `server/sql/002_training_results.sql`
3. `server/sql/003_staff_accounts.sql`
4. `server/sql/004_production_indexes.sql`

The scripts create missing tables, apply guarded refinements, and upsert the `rj45`, `fiber`, and `network` module definitions. They do not drop the database, truncate user history, or seed staff credentials.

## 3. Configure the Backend

Install production dependencies from `server/`:

```bash
npm ci --omit=dev
```

Configure these variables outside Git:

| Variable | Production requirement |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | Port assigned by the host, or the desired local service port |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_USER` | Dedicated application user |
| `DB_PASSWORD` | Non-empty database password |
| `DB_NAME` | Provisioned database name |
| `JWT_SECRET` | Cryptographically random secret of at least 32 bytes |
| `JWT_EXPIRES_IN` | Positive duration such as `8h` |
| `CLIENT_ORIGIN` | Exact HTTPS frontend origin, without a path |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAME_SITE` | Normally `lax`; use `none` only for a reviewed cross-site architecture |

Production startup fails with the missing or invalid variable name but never prints its secret value. Rotate `JWT_SECRET` deliberately because rotation invalidates current sessions.

Start the API with:

```bash
npm start
```

The server uses `process.env.PORT`, binds through Node's normal externally reachable listener, verifies MySQL before listening, and handles graceful termination signals. Keep the process alive with the hosting platform's service manager.

## 4. Build the Frontend

From the project root:

```bash
npm ci
npm run lint
npm run build
```

For a separate API origin, provide the public API base URL only during the build:

```text
VITE_API_URL=https://api.training.example/api
```

For same-origin hosting, use `VITE_API_URL=/api` or omit it. Never place database credentials, JWT secrets, staff passwords, or other private values in a `VITE_*` variable because Vite embeds those values in the public browser bundle.

Publish the generated `dist` directory without editing it manually.

## 5. Configure HTTPS and Routing

Enable HTTPS for the frontend and API before production authentication is accepted. Redirect HTTP to HTTPS at the edge or reverse proxy.

Static hosting must return `index.html` for application routes that are not real files. Preserve `/api` for the backend when using a same-origin reverse proxy.

Example Nginx shape:

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:3001/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
  try_files $uri $uri/ /index.html;
}
```

Example Apache SPA fallback for a frontend-only virtual host:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

Configure an equivalent rewrite on a managed static host. Direct refresh must work for `/login`, `/staff/login`, `/settings`, `/results`, `/instructor`, `/instructor/students`, `/instructor/modules`, and `/instructor/troubleshooting`.

## 6. Configure CORS and Cookies

- Set `CLIENT_ORIGIN` to exactly the frontend HTTPS origin.
- Do not use a wildcard with credentialed requests.
- Keep `COOKIE_SECURE=true` in production.
- Use `COOKIE_SAME_SITE=lax` for same-site domains and subdomains unless deployment testing establishes a different requirement.
- If the frontend and API are truly cross-site, `COOKIE_SAME_SITE=none` also requires secure HTTPS and a dedicated CSRF review.

The browser must receive and return the HTTP-only `telesim_session` cookie; frontend JavaScript must not copy the JWT into local storage.

## 7. Provision the First Administrator

Use `server/scripts/createStaffUser.js` through `npm run create-staff`. Inject `STAFF_PASSWORD` as a temporary process environment value or hosting secret, and pass the validated role, name, and email through command arguments or temporary environment values. The script accepts only `instructor` or `admin`, applies the shared bcrypt hashing service, and never logs the plaintext password.

Do not create a default administrator in SQL or publish a default password. After the first administrator signs in, create additional staff through Admin User Management.

## 8. Health and Production Validation

Check the non-sensitive endpoint:

```text
GET /api/health
```

Then manually verify on the actual HTTPS URL:

1. Open and refresh all public and protected routes.
2. Register and log in with a dedicated test student.
3. Refresh a protected page and confirm the session remains active.
4. Complete one training module and confirm the result exists in MySQL.
5. Log out, log back in, and confirm the result remains.
6. Verify instructor analytics against database values.
7. Verify instructor access to analytics and rejection from admin-only mutations.
8. Verify administrator access to User Management and account status controls.
9. Confirm deactivation blocks the next authenticated request without deleting history.
10. Review browser console and server logs for errors without exposing secrets.

Do not mark deployment, HTTPS, or production persistence complete until these checks pass against the deployed domain.

## 9. Rollback

- Keep the previous frontend build and backend release available for application rollback.
- Take a verified database backup before applying release migrations.
- Do not roll back by importing an older database over live data.
- Restore databases only through the tested recovery process in `docs/BACKUP_AND_RECOVERY.md`.
