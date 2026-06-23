<div align="center">

# Tower Defense Web

> A pixel-art tower defense game built with a custom Canvas 2D engine, React 18, and TypeScript — featuring 5 hand-crafted levels, 3 tower types, 5 enemy types, A\* pathfinding, and an entity-pooled game loop running at 60 FPS.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/NOSOLUTIONLOVE/Web_Game_06_Tower_Defense)

<br />

[Live Demo](#-live-demo) · [Features](#-features) · [Gameplay](#-gameplay) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [License](#-license)

**[中文说明](./README_CN.md)**

</div>

---

## Overview

**Tower Defense Web** is a browser-based strategy game where players build defensive towers on a grid map to stop waves of enemies from reaching their base. It is the 6th project in my personal Web Game series, engineered with a "quality-first v2.0 stack": a framework-agnostic game engine separated from a React UI layer, fully typed with TypeScript, and validated by unit tests.

The project demonstrates a complete game-development pipeline — from a custom Canvas 2D pixel-art renderer and A\* pathfinding, through wave/economy/combat systems, to deployment on Vercel. It is designed as a portfolio piece showcasing production-grade engineering practices in a small, focused codebase.

---

## Live Demo

The game is deployed as a static SPA on Vercel. Open it in any modern desktop browser:

> **Deploy URL:** Add your Vercel deployment link here after the first deploy (e.g. `https://web-game-06-tower-defense.vercel.app`)

**Play locally in 30 seconds:**

```bash
git clone git@github.com:NOSOLUTIONLOVE/Web_Game_06_Tower_Defense.git
cd Web_Game_06_Tower_Defense/tower-defense
npm install
npm run dev
# open http://localhost:5173
```

---

## Features

### Core Gameplay

- **5 Hand-crafted Levels** — Each level ships with a unique 16×12 grid map, custom path layout, and a tuned wave sequence. Difficulty ramps from a teaching level (straight path + one bend) to multi-bend mazes with boss waves.
- **3 Tower Types × 3 Upgrade Tiers = 9 Configurations**
  - **Archer** (single-target DPS, balanced) — emerald
  - **Frost** (applies a slow debuff, crowd-control) — sky blue
  - **Cannon** (splash AOE damage, slow but heavy) — orange
  - Each tower can be upgraded twice on the field; upgrades scale damage, range, attack speed, and effect strength.
- **5 Enemy Types** with distinct stats and behaviors
  - **Normal** — balanced HP/speed (red)
  - **Fast** — low HP, high speed, breaks through weak defenses (yellow)
  - **Heavy** — high HP, slow, requires focused fire (violet)
  - **Flying** — bypasses ground pathing, requires anti-air towers (cyan)
  - **Boss** — 1000 HP, appears on boss waves for a 100-coin reward (deep red)
- **Wave System** — Fixed wave count per level with mixed enemy compositions, configurable spawn intervals, and inter-wave prep time. Each cleared wave grants a gold bonus; boss waves pay a larger bonus.
- **Economy System** — Earn gold from kills and wave bonuses, spend on building/upgrading towers. Sell towers for a 70% refund of total invested gold.
- **Win / Lose Conditions** — Survive all waves with at least 1 life to win. Each enemy that reaches the base costs 1 life; reach 0 lives and the level is lost. Final score = `remaining lives × 100 + remaining gold`.

### Engine & Technical

- **Custom Canvas 2D Pixel-Art Renderer** — Every grid cell is rendered as 8×8 5-pixel blocks for a true pixel aesthetic. Sprites are pre-rendered to off-screen canvases and drawn via `drawImage` for performance. DPR-aware for crisp rendering on Retina displays.
- **A\* Pathfinding** — 8-directional A\* with diagonal corner-blocking, Euclidean heuristic. Solves a 16×12 grid in under 1 ms.
- **Object Pooling** — Generic `Pool<T>` reuses enemies, projectiles, and particles to avoid GC pressure during heavy waves.
- **Fixed-Timestep Game Loop** — 60 Hz fixed update with `requestAnimationFrame`, decoupled from render rate. Supports 1× and 2× time scales.
- **Web Audio API SFX** — 9 synthesized sound effects (place, upgrade, sell, shoot × 3, hit, kill, wave-start, win, lose, click) generated from sine/triangle/sawtooth waves. Zero external audio assets.
- **Particle System** — Hit flashes, kill explosions, build/upgrade/sell puffs, and floating damage numbers.
- **State Machine** — Explicit phases: `menu → levelSelect → playing ↔ betweenWaves → paused → win / over`.
- **Progress Persistence** — Level unlocks, clear status, and best scores saved to `localStorage` (with safe fallback for private-mode / quota errors).
- **Type-Safe Configuration** — All tunable parameters centralized in a single `config` module with Zod schema validation at runtime.

### UX & UI

- **Pixel-Art Aesthetic** — Consistent retro visual language across map, towers, enemies, and UI.
- **Responsive HUD** — Top bar shows lives, gold, and current wave / total waves. Bottom action bar for tower selection, wave control, pause, and speed toggle.
- **Build Preview** — Hovering a buildable cell shows a green preview with the tower's range circle; non-buildable cells show red.
- **Tower Selection Panel** — Click any empty grass cell to open the tower picker; click an existing tower to upgrade or sell.
- **Keyboard Shortcuts** — `Space` to pause/resume, `2` to toggle 2× speed.
- **Animated Overlays** — Main menu, level select, pause, win, and lose modals animated with Framer Motion.
- **Settings Panel** — Toggle sound effects on/off.
- **Dark Theme** — Default dark UI (`zinc-950` background) tuned for long play sessions.

### Quality & Tooling

- **7 Unit Test Suites** — Vitest + happy-dom covering combat, economy, wave system, enemy, tower, map grid, and pathfinder.
- **TypeScript Strict Mode** — End-to-end type safety, no `any` in the engine layer.
- **ESLint + Prettier** — Enforced code style and React hooks rules.
- **Vercel-Ready** — `vercel.json` ships SPA rewrites so client-side routing works on refresh.

---

## Gameplay

### How to Play

1. **Pick a level** from the level-select screen. Only the first level is unlocked initially; clearing a level unlocks the next.
2. **Build towers** on grass cells (empty squares). Click a grass cell → pick a tower type from the bottom panel → confirm. The build preview shows the tower's attack range.
3. **Start the wave** with the `▶ Start Wave` button. Enemies spawn from the green `S` marker and walk along the path to the red `E` marker (your base).
4. **Upgrade or sell** existing towers by clicking them. Upgrades scale damage / range / effect; selling refunds 70% of invested gold.
5. **Survive all waves** without losing all 20 lives to win. Each enemy reaching the base costs 1 life.
6. **Beat your high score** — Score = `remaining lives × 100 + remaining gold`. Best scores persist across sessions.

### Strategy Tips

- **Archer** is cost-efficient for early waves; **Frost** shines against Fast and Flying enemies; **Cannon** excels against clustered Heavy/Boss waves.
- Place **Frost** towers near path bends where enemies cluster, then cover the bend with a **Cannon** for AOE value.
- Don't overspend early — keep a reserve for emergency upgrades during boss waves.
- Use the 2× speed toggle to grind through easy waves, but slow down for boss waves to micro-manage upgrades.

### Scoring

| Event | Reward |
|-------|--------|
| Kill Normal enemy | +10 gold |
| Kill Fast enemy | +15 gold |
| Kill Heavy enemy | +25 gold |
| Kill Flying enemy | +20 gold |
| Kill Boss | +100 gold |
| Clear a wave | +25 gold (normal) / +100 gold (boss wave) |
| Final score | `lives × 100 + gold` |

---

## Quick Start

### Prerequisites

- **Node.js ≥ 18** (tested on 18 LTS and 20 LTS)
- **npm ≥ 9** (or pnpm/yarn — adjust commands accordingly)

### Install & Run

```bash
# 1. Clone
git clone git@github.com:NOSOLUTIONLOVE/Web_Game_06_Tower_Defense.git
cd Web_Game_06_Tower_Defense/tower-defense

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# → http://localhost:5173

# 4. (Optional) Run tests
npm test

# 5. (Optional) Production build
npm run build
npm run preview   # preview the production build locally
```

### Deploy to Vercel

The repo includes `vercel.json` with SPA rewrites. Two ways to deploy:

- **CLI:** `npx vercel` from the `tower-defense/` directory.
- **Dashboard:** Import the repo on [vercel.com](https://vercel.com), set the root directory to `tower-defense`, and accept the auto-detected Vite preset.

---

## Architecture

The codebase enforces a strict separation between the **engine** (framework-agnostic game logic) and the **UI** (React presentation layer). The engine has zero React imports and could be reused in any other renderer (e.g. a Phaser port or a headless server-authoritative backend).

```
tower-defense/
├── src/
│   ├── config/              # Single source of truth for all tunable params
│   │   ├── index.ts         #   GameConfig schema (Zod) + type definitions
│   │   ├── towers.ts        #   3 towers × 3 levels = 9 configs
│   │   └── enemies.ts       #   5 enemy type configs
│   │
│   ├── engine/              # Framework-agnostic game engine (no React)
│   │   ├── GameEngine.ts    #   Orchestrator: main loop + state machine
│   │   ├── Renderer.ts      #   Canvas 2D pixel-art renderer
│   │   ├── MapGrid.ts       #   Grid model + cell queries
│   │   ├── PathFinder.ts    #   A* (8-dir, corner-blocking)
│   │   ├── Pool.ts          #   Generic object pool
│   │   ├── Input.ts         #   Canvas input handler
│   │   ├── RenderSnapshot.ts#   Immutable frame snapshot for React UI
│   │   ├── entities/        #   Enemy, Tower, Projectile, Particle
│   │   ├── systems/         #   Combat / Economy / Wave / Particle systems
│   │   ├── levels/          #   5 builtin maps + waves + progress persistence
│   │   └── __tests__/       #   7 Vitest suites
│   │
│   ├── components/          # React UI layer
│   │   ├── ui/              #   shadcn/ui primitives (button, dialog, ...)
│   │   ├── TowerDefenseGame.tsx  # Root game component
│   │   ├── GameCanvas.tsx        # Canvas host + RAF bridge
│   │   ├── HUD.tsx               # Top stats bar
│   │   ├── ActionBar.tsx         # Bottom tower/wave controls
│   │   ├── TowerPanel.tsx        # Tower picker / upgrade / sell
│   │   ├── MainMenu.tsx          # Title screen
│   │   ├── LevelSelect.tsx       # Level grid
│   │   ├── SettingsPanel.tsx     # Sound toggle
│   │   └── ...                   # Win/Lose/Pause overlays, Footer, etc.
│   │
│   ├── store/
│   │   └── useGameStore.ts  # Zustand store bridging engine → UI
│   │
│   ├── lib/
│   │   ├── audio.ts         # Web Audio API SFX synthesizer (9 effects)
│   │   ├── storage.ts       # Safe localStorage wrapper
│   │   └── utils.ts         # Shared helpers (cn, etc.)
│   │
│   ├── App.tsx              # React root
│   ├── main.tsx             # Entry point
│   └── index.css            # Tailwind + global styles
│
├── public/                  # Static assets (favicon)
├── index.html               # HTML shell
├── vite.config.ts           # Vite config
├── vitest.config.ts         # Test config (happy-dom env)
├── tailwind.config.ts       # Tailwind theme
├── tsconfig.json            # TS strict config
├── vercel.json              # SPA rewrites for Vercel
└── package.json
```

### Engine ↔ UI Bridge

The engine emits immutable `RenderSnapshot`s each frame; React reads them via a Zustand store and re-renders only the affected UI components. The Canvas itself is drawn directly by the engine's `Renderer`, bypassing React's reconciler for the 60 FPS game surface. This keeps React responsible for what it's good at (menus, modals, HUD) and keeps the hot path in vanilla Canvas.

### State Machine

```
MENU ──start──▶ LEVEL_SELECT ──select──▶ PLAYING ──pause──▶ PAUSED
                     ▲                       │                  │
                     │                       │                  │ resume
                     │                       ▼                  ▼
                     │                  BETWEEN_WAVES ◀──────────┘
                     │                       │
                     │                  nextWave / clear
                     │                       ▼
                     └────────────────── WIN / OVER
```

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Language** | TypeScript 5.4 (strict) | End-to-end type safety; engine layer is `any`-free |
| **UI Framework** | React 18 | Component model for menus, HUD, and overlays |
| **Build Tool** | Vite 5 | Fast HMR, native ESM, zero-config TS support |
| **Styling** | Tailwind CSS 3 + shadcn/ui (Radix) | Utility-first + accessible primitives |
| **State** | Zustand 4 | Minimal, no boilerplate, perfect for engine→UI bridge |
| **Game Loop** | Custom Canvas 2D + RAF | Full control over rendering pipeline; no engine lock-in |
| **Animation** | Framer Motion 11 | UI transitions and modal animations |
| **Forms/Validation** | react-hook-form + Zod | Type-safe runtime config validation |
| **Audio** | Web Audio API (synthesized) | Zero asset weight, 9 SFX from oscillators |
| **Storage** | localStorage (safe wrapper) | Progress persistence with quota/private-mode fallback |
| **Testing** | Vitest 1 + happy-dom | Fast unit tests for engine systems |
| **Lint/Format** | ESLint 8 + Prettier 3 | Enforced style and React hooks rules |
| **Deploy** | Vercel | Zero-config static SPA hosting with rewrites |

---

## Project Structure Decisions

A few non-obvious choices worth highlighting for portfolio reviewers:

1. **No Phaser / no game framework.** The PRD offered Phaser 3 vs. raw Canvas 2D as options. I chose raw Canvas to demonstrate full understanding of the rendering pipeline, sprite caching, and the game loop — skills that transfer to any engine.
2. **Engine/UI isolation.** The `engine/` directory has zero React imports. This makes the engine portable (could be reused in a Phaser port, a server-authoritative multiplayer fork, or a React Native port) and keeps the hot path free of React's reconciler overhead.
3. **Single source of truth for config.** All tunable numbers (grid size, economy, combat constants, colors) live in `src/config/index.ts` with a Zod schema. Balance tweaks require touching one file.
4. **Object pooling by default.** Enemies, projectiles, and particles are pooled. This is overkill for the current enemy counts but demonstrates the right pattern for scaling to 100+ on-screen entities.
5. **Synthesized audio.** All SFX are generated at runtime from oscillators — no audio files to download, no licensing concerns, and the audio module is ~200 lines.

---

## Testing

The engine ships with 7 Vitest suites covering the core systems:

| Test File | Covers |
|-----------|--------|
| `CombatSystem.test.ts` | Target acquisition, damage application, splash, slow effects |
| `EconomySystem.test.ts` | Gold gain/spend, sell refund, wave bonus |
| `WaveSystem.test.ts` | Spawn timing, enemy composition, wave completion |
| `Enemy.test.ts` | HP, damage, slow debuff, status transitions |
| `Tower.test.ts` | Build cost, upgrade path, sell value, cooldown |
| `MapGrid.test.ts` | Cell types, buildability, path queries |
| `PathFinder.test.ts` | A\* correctness, corner-blocking, unreachable cases |

```bash
npm test           # run all suites once
npm run test:watch # watch mode for TDD
```

---

## Roadmap

The MVP and V2 scope from the PRD are complete. Possible future work:

- **Level editor** (V3) — let players design and share custom maps
- **Hero unit** — a controllable unit with active abilities
- **More tower/enemy types** — poison DOT, chain lightning, healers
- **Daily challenge** — seeded random levels with leaderboards
- **Mobile controls** — touch-friendly hit areas and pinch-to-zoom

---

## Acknowledgements

- **Design references:** [Bloons TD](https://ninjakiwi.com/) and [Kingdom Rush](https://www.ironhidegames.com/) for wave pacing and tower role archetypes.
- **A\* algorithm:** Standard 8-direction implementation with corner-blocking, inspired by the [Red Blob Games pathfinding guide](https://www.redblobgames.com/pathfinding/a-star/introduction.html).
- **shadcn/ui** for the accessible component primitives.
- **Tailwind CSS** for the utility-first styling workflow.

---

## License

This project is currently **not licensed for redistribution**. All rights reserved by the author. If you'd like to use or fork this code, please open an issue or reach out first.

---

<div align="center">

**[⬆ Back to Top](#tower-defense-web)** · **[中文说明](./README_CN.md)**

Built as project #6 of my personal Web Game series.

</div>
