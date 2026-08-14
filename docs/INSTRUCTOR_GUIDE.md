# TeleSim 3D Instructor Guide

## Staff Login

1. Open `/staff/login`.
2. Enter the instructor email and password.
3. Select **Sign In to Staff Portal**.

Valid instructor and administrator accounts are sent to `/instructor`. Student accounts are rejected with a staff-access message. There is no public staff registration.

## Overview

The Overview page presents active and total students, completion status, module performance, students needing practice, and recent training activity. Treat these values as educational records and share them only with authorized users.

## Student Records

Open **Students** to:

- Search by student identity.
- Filter by progress status or module.
- Move through validated pages of 20 or 50 records.
- Open one student without exposing password or session data.

## Student Detail

Student Detail shows the safe student profile, aggregate progress, module summaries, latest and best scores, and attempt history. Select an attempt to review stored assessment and diagnostic metrics.

## Attempts and Training Results

Use **Training Results** to filter completed attempts by student, module, score band, performance rating, and date. Attempt records are historical and read-only from the instructor portal.

## Module Analytics

Use **Module Analytics** to review participation, completions, average and best scores, score distributions, duration, and available procedure diagnostics for RJ45, Fiber, and Network training.

## Troubleshooting Analytics

Use **Troubleshooting** to compare the six Network scenarios, including participation, average score, diagnosis attempts, repair attempts, hints, and difficulty ranking.

## Data Verification

Page rendering alone does not prove analytics accuracy. For formal QA or capstone evidence, compare selected totals, student attempts, scores, and scenario values with the corresponding MySQL records.

## Role Boundaries

Instructor accounts can read approved student records and analytics. They cannot access Admin User Management or perform admin-only account mutations; the API returns `403` for those requests.

## Logout

Use **Logout** from the staff navigation. The session cookie is cleared and the application returns to `/staff/login`.
