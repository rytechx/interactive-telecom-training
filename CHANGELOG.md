# Changelog

All notable TeleSim 3D release changes are recorded here.

## [1.0.0] - 2026-08-14

### Added

- Student registration, login, HTTP-only session recovery, dashboard, profile, settings, results, and logout.
- Dedicated staff portal with instructor analytics and admin-only account management.
- Persistent MySQL training attempts, progress, assessments, and troubleshooting scenario results.
- Complete RJ45 cable termination workflow with manual T568B conductor arrangement and cable testing.
- Complete fiber-optic fusion-splicing workflow with preparation, cleaning, cleaving, fusion, protection, and inspection.
- Network device installation, router and switch CLI practice, PC IPv4 configuration, connectivity tests, and six troubleshooting scenarios.
- Keyboard accessibility, focus states, high-contrast and larger-text settings, reduced-motion support, resilient error states, and session-expiry handling.
- Production environment validation, secure cookie controls, deployment guidance, backup procedures, role guides, and release checklists.

### Security

- Enforced bcrypt password hashing, server-controlled student registration roles, active-account checks, and server-side role authorization.
- Enforced student-owned training records, score bounds, sanitized metrics, parameterized SQL filters, and idempotent completion saves.
- Restricted credentialed CORS to the configured frontend origin and required secure production authentication settings.

### Notes

- Release tagging remains gated on manual acceptance of the deployed domain, HTTPS authentication, and production database persistence.
