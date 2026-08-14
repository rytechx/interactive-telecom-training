# Backup and Recovery

Use encrypted, access-controlled storage for production backups. Never commit database exports, `.env` files, or secret-manager exports to Git.

## Backup Scope

Back up these items independently:

- MySQL data and schema
- Production environment variable names and secret values in an approved secret manager
- Git source and release tags
- Hosting and DNS configuration records

The repository already contains reproducible schema and module seeds. Production student and staff records belong only in protected database backups.

## Database Export

Run exports from a trusted administrative host. Use `-p` so MySQL prompts for the password instead of placing it in shell history:

```bash
mysqldump --host=<db-host> --port=<db-port> --user=<backup-user> -p --single-transaction --routines --triggers --no-tablespaces <database-name> > telesim-backup.sql
```

Immediately move the export outside the repository, encrypt it, record its timestamp and environment, and verify that it is non-empty. Store it according to the institution's retention policy.

For schema-only review without student records:

```bash
mysqldump --host=<db-host> --port=<db-port> --user=<backup-user> -p --no-data --routines --triggers --no-tablespaces <database-name> > telesim-schema-only.sql
```

Do not add either export to Git. The `.gitignore` excludes common backup directories and dump suffixes, but operational controls remain the primary safeguard.

## Database Restore

1. Confirm the backup source, checksum, encryption key, and intended restore point.
2. Provision an empty staging database first.
3. Restore with a least-privilege restore account:

```bash
mysql --host=<db-host> --port=<db-port> --user=<restore-user> -p <database-name> < telesim-backup.sql
```

4. Run `npm run migrate` from `server/` to apply any newer non-destructive migrations.
5. Verify module seeds, user counts, attempt counts, latest completion timestamp, and representative student history.
6. Start the API against staging and run login, result read, instructor analytics, and health checks.
7. Restore production only after the staging rehearsal succeeds and the maintenance window is approved.

Never overwrite a healthy production database merely to test a backup.

## Environment Backup

- Record every required variable name from `server/.env.example` and the root `.env.example`.
- Store production values in the hosting environment or an approved encrypted secret manager.
- Keep recovery access separate from day-to-day application credentials.
- Rotate database, JWT, and staff secrets after suspected exposure.
- Never place a production `.env` in email, chat, issue trackers, documentation, or Git.

## Git Source Recovery

1. Clone the trusted repository and check out the accepted release tag.
2. Run `npm ci` in the root and `server/` directories.
3. Restore environment values from the secret manager.
4. Restore or provision MySQL, then run `npm run migrate` in `server/`.
5. Build the frontend with `npm run build` and start the API with `npm start`.
6. Complete the production validation checklist before reopening access.

## Recommended Schedule

- Take automated daily database backups while training is active.
- Keep at least one recent off-site or cross-account backup.
- Take an on-demand backup before every migration or release.
- Test a restore regularly; an untested backup is not a recovery plan.
- Document recovery point and recovery time objectives with the project owner and hosting provider.
