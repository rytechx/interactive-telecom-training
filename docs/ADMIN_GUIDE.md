# TeleSim 3D Administrator Guide

Administrators use the same `/staff/login` entry and instructor analytics portal, with additional access to User Management.

## User Management

Open `/instructor/users` to search and filter student, instructor, and administrator accounts by role and active status. Password hashes, JWTs, and cookies are never displayed.

## Creating Staff

1. Select **Create Staff Account**.
2. Enter the staff member's name and unique email.
3. Choose exactly `instructor` or `admin`.
4. Set a unique password that meets the displayed minimum.
5. Confirm creation.

The server validates the email and role, hashes the password with bcrypt, leaves `student_number` empty, and rejects duplicate emails. Never send a staff password through source control, documentation, chat, or an issue tracker.

For the first administrator only, use the controlled `server/scripts/createStaffUser.js` process documented in the README and Deployment Guide. Production SQL seeds must never contain default staff credentials.

## Activating and Deactivating Accounts

- Deactivate an account to block future logins and the next authenticated API request.
- Reactivate only after identity and authorization are confirmed.
- Deactivation changes `is_active`; it does not delete attempts, results, or analytics history.
- The API prevents an administrator from deactivating the current account.

## Role Management

- Assign `student`, `instructor`, or `admin` only when the user's real responsibilities require it.
- Instructor access includes student educational records.
- Administrator access also includes account creation, role changes, and status changes.
- The API prevents an administrator from changing the current account's role.
- Review role changes promptly and follow least-privilege practice.

## Security Cautions

- Use named accounts; do not share an administrator login.
- Use unique passwords and an approved password manager.
- Keep production environment values in the hosting secret system.
- Confirm HTTPS and secure-cookie behavior before production use.
- Deactivate departed staff promptly while preserving historical records.
- Review server logs without recording passwords, JWTs, password hashes, or database credentials.
- Back up MySQL before migrations and rehearse restoration in staging.

## Logout

Use **Logout** after administrative work, especially on shared or presentation computers. Confirm the app returns to `/staff/login`.
