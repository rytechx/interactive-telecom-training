# Coding Standards

## Purpose

These standards keep TeleSim 3D consistent, maintainable, performant, and approachable for student developers. Existing project conventions take priority when they are more specific than a general guideline below.

## JavaScript and JSX

- Use JavaScript and JSX; do not introduce TypeScript unless the project formally adopts it.
- Use modern ES modules with `import` and `export`.
- Prefer `const`; use `let` only when a binding must change.
- Use single quotes, two-space indentation, and the repository's existing no-semicolon style.
- Include trailing commas in multiline arrays, objects, parameters, and JSX-friendly data structures where supported.
- Use descriptive names instead of abbreviations or single-letter identifiers.
- Keep functions focused and extract repeated behavior into a component, hook, utility, or store action.
- Remove imports only after confirming they are unused.

## React Component Naming

- Name React component files and components with PascalCase, such as `TelecomLabScene.jsx`.
- Use one primary exported component per component file.
- Name hooks with the `use` prefix, such as `useKeyboardControls.js`.
- Name Zustand stores with the `use...Store` pattern, such as `useInteractionStore.js`.
- Prefer named components and readable JSX over large anonymous render blocks.

## Folder Naming

- Use lowercase capability folders such as `player`, `objects`, `interaction`, `store`, and `utils`.
- Use PascalCase for a scene or module folder that represents a named feature, such as `scenes/TelecomLab`.
- Group reusable object components by domain, such as `objects/furniture` and `objects/telecom`.
- Place feature assembly components near the scene or feature they assemble.
- Do not create empty folders or speculative abstractions without a current use.

## Props

- Use descriptive prop names such as `position`, `rotation`, `scale`, and `interactionDistance`.
- Provide sensible default values for reusable 3D object props when appropriate.
- Pass Three.js vectors and Euler values as numeric arrays in the established `[x, y, z]` format.
- Avoid mutating arrays, objects, or references received through props.
- Keep required props minimal and document unusual units or coordinate assumptions.
- Avoid prop spreading onto Three.js objects unless the accepted values are intentionally unrestricted.

## State Management

- Keep temporary, component-specific UI state in local React state.
- Use Zustand for state shared across distant components or systems, such as interaction and training mode.
- Keep store state small, serializable where practical, and organized around clear actions.
- Update store state through named actions rather than from unrelated components directly.
- Avoid writing rapidly changing per-frame values to Zustand; use refs for frame-loop data such as player position.
- Reset related state explicitly when leaving a module so stale training data cannot leak into the next session.

## React Three Fiber

- Create the `Canvas` at the scene boundary and avoid duplicate canvases or cameras.
- Build scenes from small, reusable components with clear responsibilities.
- Use `useFrame` only for frame-dependent work and keep its callback lightweight.
- Reuse geometry and materials when many identical objects are introduced.
- Set `castShadow` and `receiveShadow` only where they improve the scene.
- Keep object coordinates, room dimensions, and interaction anchors consistent through shared constants when duplication becomes significant.
- Do not manipulate the world to simulate first-person movement; move the player rigid body and camera together.
- Dispose manually created Three.js resources when React Three Fiber cannot manage them automatically.

## Physics

- Wrap the simulated world in one Rapier `Physics` provider.
- Use fixed colliders for static architecture and major stationary objects.
- Use an appropriate dynamic rigid body and capsule collider for the player.
- Lock player rotation and apply damping to avoid tipping and excessive sliding.
- Keep visual geometry and collider dimensions aligned closely enough to prevent confusing collisions.
- Avoid unnecessary colliders on small decorative geometry.
- Do not change established movement speeds, gravity behavior, or collider positions without validating all affected interactions.

## Event Listeners

- Register browser event listeners inside `useEffect` or a dedicated hook.
- Always remove every listener in the effect cleanup function.
- Keep handler references stable enough for correct removal.
- Prevent duplicate keyboard, pointer-lock, and mouse listeners under React Strict Mode.
- Clear held-key state when focus or pointer lock is lost to prevent stuck movement.

## Performance

- Prefer simple box, cylinder, plane, and low-segment geometry for placeholders.
- Keep work inside `useFrame` allocation-free where practical; reuse vectors and other temporary objects.
- Avoid unnecessary React state updates during animation frames.
- Use memoization only when measurement or repeated work justifies it.
- Limit real-time lights and shadow casters; tune shadow-map size intentionally.
- Compress and lazy-load future textures, audio, and 3D models.
- Review production bundle warnings and introduce code splitting before feature growth makes them blocking.

## Comments and Documentation

- Prefer clear component, function, and variable names over comments that restate code.
- Add comments only for non-obvious decisions, coordinate assumptions, browser constraints, or algorithmic reasoning.
- Keep comments current when behavior changes.
- Document user-facing controls, architecture changes, limitations, and setup changes in the relevant Markdown files.

## Error Handling

- Validate external or persisted data before using it.
- Handle expected browser capability failures, including pointer-lock rejection, without crashing the scene.
- Provide user-readable recovery guidance for recoverable errors.
- Log actionable development details without exposing secrets or sensitive user data.
- Use error boundaries around future high-level application areas when a recoverable fallback can be provided.
- Do not silently ignore failed async operations.

## Package Installation Policy

- Reuse installed dependencies before adding a new package.
- Add a package only when it solves a confirmed requirement and its maintenance, bundle, license, and security costs are acceptable.
- Obtain project approval before installing or replacing dependencies.
- Use the existing package manager and update both `package.json` and its lockfile together.
- Never edit files inside `node_modules`.

## Source-Code Modification Policy

- Inspect the affected architecture and repository instructions before editing.
- Make focused changes that address the requested behavior without unrelated refactors.
- Preserve working features and public component contracts unless a planned migration is documented.
- Do not delete or rename working files without a verified reason and impact review.
- Do not commit generated output, local secrets, or machine-specific absolute paths.
- Keep application code, documentation, and tests synchronized.

## Lint and Build Requirements

- Run `npm run lint` after source-code changes and resolve errors introduced by the work.
- Run `npm run build` before considering a change complete.
- Start with targeted checks when available, then run the required project-wide checks.
- Record any remaining warnings and distinguish pre-existing warnings from new issues.
- Perform relevant manual browser checks for 3D controls, collisions, overlays, and responsive behavior.

## Beginner-Readable Code

- Prefer direct data flow and small components over clever abstractions.
- Use descriptive intermediate variables for movement, distance, and state transitions.
- Keep control flow shallow and use early returns when they improve clarity.
- Introduce helpers only when they remove real repetition or isolate a clear responsibility.
- Organize code so a beginner can trace input, state, rendering, and cleanup without hidden side effects.
