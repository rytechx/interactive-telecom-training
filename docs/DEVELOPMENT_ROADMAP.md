# Development Roadmap

## Purpose

This roadmap organizes development of **TeleSim 3D: Interactive Telecom Training Application with Virtual Troubleshooting Scenarios** into incremental, testable sprints. Completion marks reflect only features verified in the current repository.

## Status Legend

- `[x]` Verified in the current implementation
- `[ ]` Planned and not yet complete

## Current Baseline

The project currently provides the 3D laboratory foundation, first-person exploration, collision handling, and a basic RJ45 workstation interaction shell. It does not yet provide a complete training procedure, assessment system, troubleshooting simulation, user accounts, API, or database.

## Sprint 1 — Foundation

**Goal:** Establish a stable browser-based 3D environment that can support future training modules.

- [x] React and Vite project foundation
- [x] React Three Fiber scene rendering
- [x] Enclosed telecom laboratory environment
- [x] Low-poly furniture and telecom equipment placeholders
- [x] First-person controller with mouse look and keyboard movement
- [x] Rapier physics and collision for the player, room, and major objects
- [x] Basic reusable proximity interaction framework

**Verified outcome:** A user can explore the laboratory, collide with its boundaries and major objects, approach the RJ45 workbench, and open or close a basic training overlay.

## Sprint 2 — Workstation Framework

**Goal:** Turn the current interaction shell into a reusable workstation experience.

- [ ] Workstation focus mode
- [ ] Smooth camera transition to a workstation view
- [ ] Training overlay improvements
- [ ] Reusable workstation configuration
- [ ] Reliable enter and exit transition handling

**Dependency:** Builds on the existing RJ45 proximity interaction and Zustand training state. The current overlay does not yet move the camera or provide a reusable workstation configuration.

## Sprint 3 — RJ45 Training Module

**Goal:** Implement a complete guided RJ45 cable termination procedure.

- [ ] Cable inspection
- [ ] Cable stripping
- [ ] Pair separation
- [ ] T568B wire arrangement
- [ ] Wire trimming
- [ ] Connector insertion
- [ ] Crimping
- [ ] Cable testing
- [ ] PASS and FAIL results

**Dependency:** Requires the workstation framework and a defined procedure-state model. The existing message to inspect tools is a placeholder, not a completed procedure step.

## Sprint 4 — Assessment

**Goal:** Measure learner performance and provide useful feedback.

- [ ] Training timer
- [ ] Mistake tracking
- [ ] Contextual hints
- [ ] Procedure accuracy calculation
- [ ] Final score calculation
- [ ] Results page
- [ ] Local progress saving

**Dependency:** Requires a complete RJ45 procedure with observable, validated actions.

## Sprint 5 — Troubleshooting Prototype

**Goal:** Add the first scenario-driven network troubleshooting exercise.

- [ ] Loose cable fault
- [ ] Device power failure
- [ ] Incorrect IP configuration
- [ ] Disabled network port
- [ ] Diagnostic tool use
- [ ] Repair validation

**Dependency:** Requires reusable scenario state, diagnostic actions, success conditions, and assessment integration.

## Sprint 6 — Accounts and Database

**Goal:** Support managed learner access and persistent academic records.

- [ ] Student authentication
- [ ] Instructor authentication
- [ ] MySQL database
- [ ] REST API
- [ ] Progress records
- [ ] Scores and reports

**Dependency:** Requires approved data models, privacy requirements, an authentication design, and a selected backend framework. No backend or database is currently implemented.

## Sprint 7 — Additional Training Modules

**Goal:** Expand the platform beyond RJ45 termination and introductory troubleshooting.

- [ ] Copper splicing
- [ ] Fiber preparation
- [ ] Fiber fusion splicing
- [ ] Router and switch configuration

**Dependency:** Reuse the workstation, procedure, assessment, persistence, and reporting systems established in earlier sprints.

## Delivery Priorities

1. Keep exploration and collision behavior stable while adding training features.
2. Build reusable workstation and procedure systems before adding multiple modules.
3. Validate every training action before introducing scoring.
4. Add persistence only after local training and assessment behavior is stable.
5. Optimize large assets and code delivery before adding external 3D models or textures.

## Sprint Completion Rule

A sprint is complete only when its listed behavior is implemented, lint and production build checks pass, affected manual tests pass, documentation is updated, and no known blocking regression remains.
