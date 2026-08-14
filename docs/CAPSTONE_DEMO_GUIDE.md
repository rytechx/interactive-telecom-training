# TeleSim 3D Capstone Demo Guide

Use pre-verified demonstration accounts and a backed-up local or staging database. Never display passwords, `.env` files, browser storage, or raw password hashes during the presentation.

## Before the Presentation

- Start MySQL, the Node API, and the Vite frontend.
- Confirm `/api/health` returns a safe success response.
- Confirm the student, instructor, and administrator accounts are active.
- Preload the 3D laboratory once to warm browser caches.
- Verify audio level, display resolution, WebGL, keyboard, and mouse controls.
- Keep the approved Network layout unchanged: Preparation Table left, Network Rack center, PC Workstation right.
- Take a database backup and keep a short screen recording as contingency evidence.

## Suggested 20–25 Minute Flow

### 1. Student Experience — 3 minutes

1. Sign in through `/login`.
2. Show persisted Dashboard progress, recent activity, skills, and module cards.
3. Briefly show Results and Settings.

### 2. RJ45 Training — 4 minutes

1. Enter the laboratory and approach the RJ45 workstation.
2. Show cable selection, stripping, and pair separation.
3. Manually move several conductors and explain T568B validation.
4. If time allows, show connector insertion, crimping, cable test PASS, and assessment.

### 3. Fiber Training — 3 minutes

1. Show stripping, cleaning wipe, and cleaving.
2. Load fibers A and B into the fusion splicer.
3. Demonstrate alignment, fusion, splice loss, sleeve heating, cooling, and inspection.

### 4. Network Installation — 5 minutes

1. Establish the left/center/right workstation layout.
2. Show device mounting, PDU outlets, Switch Port 2, and Router G0/0.
3. Demonstrate router and switch CLI configuration.
4. Configure the PC and ping the router and switch.
5. Rotate around the rack to demonstrate 360-degree inspection.

### 5. Troubleshooting — 3 minutes

1. Start one of the six scenarios.
2. Use a diagnostic command to identify the fault.
3. Apply the repair, verify connectivity, and show assessment feedback.

### 6. Persistence — 2 minutes

1. Complete or open a saved assessment.
2. Return to Results and show the stored attempt.
3. Explain that logout/login persistence is backed by MySQL rather than browser-only state.

### 7. Instructor Analytics — 3 minutes

1. Log out and open `/staff/login`.
2. Sign in as an instructor.
3. Show Overview, Student Records, one Student Detail, Module Analytics, Training Results, and Troubleshooting Analytics.
4. Reference a value previously compared with MySQL.

### 8. Administrator Controls — 2 minutes

1. Sign in as an administrator or use an already authenticated admin session.
2. Show User Management, role protection, and activation/deactivation controls.
3. Explain that deactivation preserves historical training records.

## Presentation Notes

- Describe instructor and administrator capabilities without exposing account credentials.
- Prefer one complete interaction per module over rushing every control.
- Explain assessment and persistence only after showing visible evidence.
- Do not claim production deployment, HTTPS, or production persistence unless the deployed URL has passed the Production Checklist.
- If WebGL fails, use the prepared recording and continue with the live dashboard, persistence, and staff analytics portions.
