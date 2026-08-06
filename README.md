# TeleSim 3D: Interactive Telecom Training Application with Virtual Troubleshooting Scenarios

TeleSim 3D is a browser-based immersive training application for practicing telecommunications procedures and troubleshooting scenarios in a safe, repeatable virtual laboratory. The project is designed as an academic and capstone-ready foundation for guided skills training, assessment, and future instructor reporting.

> **Development status:** The project is under active development. The 3D laboratory, first-person exploration, collision system, and basic RJ45 workstation interaction are implemented. Full training procedures, scoring, troubleshooting scenarios, accounts, and persistence remain planned.

## Current Features

- Full-screen, responsive React Three Fiber scene
- Enclosed `20 m × 20 m × 4 m` telecom laboratory
- Floor, walls, ceiling, entrance door, windows, and LED fixtures
- Low-poly workbenches, stools, storage, network rack, devices, and RJ45 tools
- First-person mouse look with pointer lock
- Camera-relative WASD movement and Shift running
- Rapier player, wall, floor, furniture, rack, and cabinet collision
- Crosshair and movement instruction HUD
- Reusable proximity interaction system backed by Zustand
- Basic RJ45 training overlay with begin and exit states

## Planned Features

- Reusable workstation focus mode and camera transitions
- Complete guided RJ45 cable termination procedure
- PASS and FAIL cable testing outcomes
- Timer, mistakes, hints, accuracy, scores, and results
- Local progress saving
- Virtual network troubleshooting scenarios
- Student and instructor accounts
- REST API, MySQL persistence, progress records, and reports
- Copper splicing, fiber preparation, fusion splicing, and device configuration modules

See the [development roadmap](docs/DEVELOPMENT_ROADMAP.md) for sprint details and completion status.

## Technology Stack

- React 19
- Vite 8
- JavaScript and JSX
- Three.js
- React Three Fiber
- Drei
- React Three Rapier
- Zustand
- React Router, installed for planned navigation but not currently used
- ESLint

## Installation

### Prerequisites

- A current Node.js release compatible with Vite 8
- npm
- A desktop browser with WebGL and Pointer Lock API support
- Keyboard and mouse for first-person controls

### Setup

```bash
git clone <repository-url>
cd Interactive-Telecom-Training
npm install
npm run dev
```

Open the local address printed by Vite in a top-level browser tab. Some embedded preview environments block pointer lock.

## Development Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot module replacement |
| `npm run lint` | Check JavaScript and JSX with ESLint |
| `npm run build` | Create an optimized production build |
| `npm run preview` | Preview the production build locally |

## Controls

| Input | Action |
| --- | --- |
| Click canvas | Activate pointer lock and mouse look |
| Mouse | Look around |
| `W` / `A` / `S` / `D` | Move forward / left / backward / right |
| `Shift` | Run while moving |
| `E` | Interact when the RJ45 prompt is active |
| `Escape` | Release pointer lock or exit the training overlay |

The RJ45 workbench interaction prompt becomes available within approximately `2.2 m` while pointer lock is active.

## Project Structure

```text
src/
├── interaction/          Reusable proximity interaction components
├── objects/
│   ├── furniture/        Low-poly laboratory furniture
│   └── telecom/          Telecom equipment and tool placeholders
├── player/               First-person player and keyboard controls
├── scenes/
│   └── TelecomLab/       Scene, room, lighting, assemblies, and colliders
├── store/                Shared Zustand interaction state
├── App.jsx               Application entry component
├── index.css             Full-screen canvas and HUD styling
└── main.jsx              React DOM bootstrap

docs/                     Design, roadmap, standards, and test documentation
```

Generated dependency and build folders such as `node_modules` and `dist` are not part of the documented source structure.

## Documentation

- [Technical Design Specification](docs/TECHNICAL_DESIGN_SPECIFICATION.md)
- [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Coding Standards](docs/CODING_STANDARDS.md)
- [Testing Checklist](docs/TESTING_CHECKLIST.md)

## Current Limitations

- The RJ45 module currently provides only an initial training-state placeholder.
- There is no complete procedural simulation, tool manipulation, scoring, timer, or feedback system.
- Troubleshooting scenarios are not implemented.
- Progress is not persisted locally or remotely.
- Authentication, backend services, REST endpoints, and database storage are not implemented.
- React Router is installed but no multi-page routing flow is currently active.
- The scene uses primitive geometry without external production models or textures.
- Pointer lock requires a supported top-level browser context and may fail in embedded previews.
- The production bundle currently includes the 3D and physics engines in the main client bundle and may trigger a large-chunk warning.

## License

License information has not yet been selected. Add the approved project license before public distribution.

## Vite Foundation Notes

The project retains the original Vite React setup with hot module replacement and ESLint rules.

Vite provides two official React plugin options; this project currently uses `@vitejs/plugin-react`:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## ESLint Configuration

The application intentionally remains in JavaScript and JSX. If the project later adopts TypeScript, the [Vite TypeScript template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) and [`typescript-eslint`](https://typescript-eslint.io) provide type-aware linting guidance.
