# Third-Party Notices

TeleSim 3D uses open-source JavaScript libraries declared in the root and `server` package manifests. Their licenses and notices are distributed by their respective packages and must be preserved in any deployment or source distribution.

## Runtime Libraries

| Package group | Installed package metadata |
| --- | --- |
| React, React DOM, React Router, Zustand | MIT |
| Three.js, React Three Fiber, Drei | MIT |
| React Three Rapier | The installed package manifest does not declare a license; verify the upstream release notice before redistribution |
| Express, mysql2, jsonwebtoken, cors, cookie-parser | MIT |
| bcryptjs | BSD-3-Clause |
| dotenv | BSD-2-Clause |

## Development Tooling

- Vite, the React Vite plugin, ESLint, React Hooks lint rules, and JavaScript type definitions

## Project Assets

- The shipped interface icons and favicon are project-local SVG assets.
- The current 3D equipment, laboratory geometry, materials, textures, and visual effects are generated in application code; no external model or texture pack is bundled.
- Training ambience and effects are synthesized with the Web Audio API; no external music or sound recording is bundled.
- TeleSim 3D does not claim ownership of third-party libraries. Review dependency license files when packaging a public or commercial distribution.

An unreferenced development image may remain under `src/assets`; it is not imported into the runtime or production bundle and should not be redistributed until its provenance is confirmed.
