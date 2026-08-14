# TeleSim 3D Production Checklist

Complete this checklist for the actual production environment. Keep secrets and student records out of the checklist evidence.

## Release Package

- [ ] Accepted commit is identified and reviewed.
- [ ] Root and server package versions are correct.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes and `dist` contains the expected frontend.
- [ ] `npm test` passes in `server/`.
- [ ] Database integration tests pass against a disposable test dataset.
- [ ] No real credentials or production dumps exist in Git history or the release files.
- [ ] Third-party notices have been reviewed.

## Domain, DNS, and HTTPS

- [ ] Production frontend domain is approved.
- [ ] API same-origin path or API subdomain architecture is approved.
- [ ] DNS records resolve to the intended hosts.
- [ ] TLS certificates are valid and automatically renewed.
- [ ] HTTP redirects to HTTPS.
- [ ] Actual frontend and API HTTPS URLs have been manually opened.

## Frontend

- [ ] `VITE_API_URL` is set to `/api` or the intended public HTTPS API URL at build time.
- [ ] No secret exists in any `VITE_*` variable.
- [ ] The generated `dist` directory is published without manual edits.
- [ ] Static hosting serves `index.html` for client routes.
- [ ] Direct refresh works for login, staff login, student routes, and instructor routes.
- [ ] No missing asset or case-sensitive import error appears in the console.

## Backend Environment

- [ ] `NODE_ENV=production`.
- [ ] `PORT` is available to the hosting platform.
- [ ] All `DB_*` values target the production database.
- [ ] `JWT_SECRET` is unique, random, at least 32 bytes, and stored only in the secret system.
- [ ] `JWT_EXPIRES_IN` matches the approved session lifetime.
- [ ] `CLIENT_ORIGIN` exactly matches the frontend HTTPS origin.
- [ ] `COOKIE_SECURE=true`.
- [ ] `COOKIE_SAME_SITE` matches the approved domain architecture.
- [ ] `npm start` launches without nodemon and MySQL startup verification passes.
- [ ] `/api/health` returns only the safe status payload.

## Database

- [ ] Dedicated database and least-privilege application user are provisioned.
- [ ] A verified backup exists before migration.
- [ ] `npm run migrate` completes in the documented order.
- [ ] `users`, `training_modules`, `training_attempts`, and `network_scenario_results` exist.
- [ ] `rj45`, `fiber`, and `network` module definitions exist exactly once.
- [ ] Required attempt ownership, module, status/completion, and scenario indexes exist.
- [ ] No default staff credentials or real student seed records exist.
- [ ] Restore procedure has been rehearsed in staging.

## Authentication and Authorization

- [ ] Student registration always creates `role=student`.
- [ ] Passwords are bcrypt hashes and are never returned by APIs.
- [ ] Student login, auth reload, protected route, logout, and login again work over HTTPS.
- [ ] Staff login redirects instructors and administrators to `/instructor`.
- [ ] A student account is rejected from the Staff Portal.
- [ ] A student cannot access instructor APIs.
- [ ] An instructor can access approved analytics APIs.
- [ ] An instructor receives `403` from admin-only APIs.
- [ ] An administrator can access approved User Management APIs.
- [ ] An inactive account is blocked on login and on its next authenticated request.
- [ ] Administrator password is unique and not a documented default.

## Training and Persistence

- [ ] A production test student completes one training module.
- [ ] The completed attempt appears in MySQL with a score from 0 to 100.
- [ ] Logout/login preserves the result.
- [ ] Dashboard latest, best, count, progress, and recent activity match MySQL.
- [ ] RJ45 manual conductor arrangement, validation, crimp, test, assessment, and persistence pass.
- [ ] Fiber cleaning, cleaving, fusion, splice loss, sleeve, heat, assessment, and persistence pass.
- [ ] Network approved layout, installation, CLI, IPv4, pings, assessment, and persistence pass.
- [ ] All six troubleshooting repairs, assessments, and scenario records pass.
- [ ] Repeating a completion save does not create a duplicate completed attempt.

## Staff and Analytics

- [ ] Instructor Overview values match MySQL.
- [ ] Student search, filters, detail, and attempt history work.
- [ ] Module and Training Results analytics match sampled database values.
- [ ] Troubleshooting analytics match sampled scenario records.
- [ ] Admin activation/deactivation works and historical attempts remain.
- [ ] Staff profile and logout work.

## Accessibility and Responsive QA

- [ ] Keyboard navigation and visible focus states work.
- [ ] Reduced motion, larger text, and high contrast work.
- [ ] Forms retain labels and required-field semantics.
- [ ] Audio is not the only success or error feedback.
- [ ] No critical overlap occurs at 1280×720, 1366×768, and 1920×1080.
- [ ] Chrome has been manually tested and version recorded.
- [ ] Edge has been manually tested and version recorded.

## Release Approval

- [ ] Production deployment URL is recorded privately.
- [ ] Production authentication and cookie persistence are verified over HTTPS.
- [ ] Production save/read persistence is verified.
- [ ] Student, instructor, and administrator acceptance is signed off.
- [ ] Git working tree is clean after the approved commit.
- [ ] Release tag is created only after every production gate above passes.
