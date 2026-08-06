# Testing Checklist

## Purpose

Use this checklist for manual regression testing before a release, demonstration, or major merge. Record the browser, operating system, commit or branch, tester, and date for each test session.

## Test Session

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Browser and version | |
| Operating system | |
| Commit or branch | |
| Result | Pass / Fail / Blocked |

## Preparation

1. Install dependencies with `npm install` when setting up a fresh checkout.
2. Start the development server with `npm run dev`.
3. Open the application in a top-level desktop browser tab. Embedded previews may reject pointer lock.
4. Open the browser developer console before testing.
5. Use a keyboard and mouse for first-person control tests.

## Application and Scene

- [ ] **Application startup:** The development server starts, the page loads, and no blank screen appears.
- [ ] **Scene rendering:** The blue environment, gray floor, walls, ceiling, door, windows, lighting, furniture, and telecom equipment render.
- [ ] **Responsive layout:** The canvas and overlays fill the viewport after resizing to common desktop dimensions.
- [ ] **Browser console errors:** No uncaught errors, repeated warnings, or failed local asset requests appear during the full test session.

## First-Person Controls

- [ ] **Pointer lock:** Clicking the canvas activates pointer lock in a supported top-level browser context.
- [ ] **Mouse look:** Horizontal and vertical mouse movement rotates the view naturally without rolling the camera.
- [ ] **WASD movement:** `W`, `A`, `S`, and `D` move forward, left, backward, and right relative to the camera direction.
- [ ] **Running:** Holding `Shift` while moving increases speed without causing instability.
- [ ] **Escape release:** Pressing `Escape` during exploration releases pointer lock and restores the start instructions.
- [ ] **No unintended movement:** Releasing keys or losing focus stops movement and does not leave a key stuck.

## Collision

- [ ] **Wall collision:** The player cannot pass through any room wall or leave the enclosed laboratory.
- [ ] **Floor collision:** The player remains above the floor and does not fall through it.
- [ ] **Furniture collision:** The player cannot pass through either workbench, either stool, the storage cabinet, or the network rack.
- [ ] **Stable player body:** Contact with corners and objects does not tip, launch, or permanently trap the player.

## RJ45 Interaction

- [ ] **Outside interaction distance:** No prompt appears when the player is farther than approximately `2.2 m` from the RJ45 workbench.
- [ ] **Inside interaction distance:** `Press E to interact` appears at the bottom center only when the player is close enough and pointer lock is active.
- [ ] **Press E interaction:** Pressing `E` while the prompt is active enters RJ45 training mode.
- [ ] **Inactive E key:** Pressing `E` outside interaction range or without an active prompt does not open training mode.
- [ ] **Training mode:** The scene remains visible, normal movement stops, pointer lock is released, instructions disappear, and the `RJ45 Cable Termination` overlay appears.
- [ ] **Begin Training:** Selecting `Begin Training` displays `Step 1: Inspect the tools on the workbench.`
- [ ] **Exit Training button:** Selecting `Exit` closes the overlay and allows exploration and pointer lock to resume.
- [ ] **Exit Training with Escape:** Pressing `Escape` while the training overlay is open closes training mode cleanly.

## HUD Visibility

- [ ] **Exploration crosshair:** The centered crosshair is visible while exploring and pointer lock is active.
- [ ] **Training crosshair:** The crosshair is hidden while training mode is active.
- [ ] **Instruction overlay:** Movement instructions are visible before pointer lock and are reduced or hidden after pointer lock begins.
- [ ] **Prompt placement:** The interaction prompt remains legible and bottom-centered without covering training controls.

## Quality Checks

- [ ] **Lint:** Run `npm run lint`; it exits successfully with no new errors.
- [ ] **Production build:** Run `npm run build`; it exits successfully and produces the production bundle.
- [ ] **Warning review:** Record and assess every remaining lint, build, runtime, and browser warning.
- [ ] **Regression review:** Confirm no previously working scene, movement, collision, HUD, or interaction behavior was lost.

## Issue Record

For each failed or blocked check, record:

- Test name
- Steps to reproduce
- Expected result
- Actual result
- Browser and operating system
- Console output or screenshot
- Severity and owner
