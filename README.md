<div align="center">

# Nexus HQ

### 3D Real-Time Dashboard for AI Agents

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.183-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Live Demo:** [nexus-hq-lake.vercel.app](https://nexus-hq-lake.vercel.app)

</div>

---

![Nexus HQ Dashboard](./docs/screenshot.png)

## What It Does

Nexus HQ renders your local AI agents as animated avatars inside a 3D office environment. It streams real-time agent activity — thinking, tool execution, and approval flows — into a visual workspace you can actually see. Built to integrate with [ClawOS](https://github.com/xbrxr03/clawos).

Instead of reading terminal logs, you walk into a virtual office:

- 🧑‍💻 **Agent avatars** sit at desks, change posture when working, idle, or awaiting approval
- 🏢 **Three zones** — Nexus (blue), PicoClaw (amber), OpenClaw (violet) — each lit with its own accent color
- 📡 **Real-time events** stream in via WebSocket — task starts, completions, approval requests
- 🖥️ **HUD overlay** shows connected runtimes, agent count, and connection status
- 📋 **Live feed** scrolls agent events as they happen
- 🎴 **Avatar cards** — click any agent to see details and reset stalled sessions
- 🎭 **Demo mode** — no ClawOS required. Simulated agents show what the dashboard looks like in action

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│                                                  │
│  ┌──────────────┐  ┌──────────┐  ┌───────────┐ │
│  │  React Three  │  │  UI      │  │  HUD +    │ │
│  │  Fiber Scene  │  │  Overlay │  │  LiveFeed  │ │
│  │  (3D Office)  │  │  (HTML)  │  │  (HTML)   │ │
│  └──────┬────────┘  └────┬─────┘  └─────┬─────┘ │
│         │                │               │       │
│         └────────────────┼───────────────┘       │
│                          │                       │
│                  ┌───────┴───────┐               │
│                  │  useClawOS    │               │
│                  │  (data hook)  │               │
│                  └───┬───────┬───┘               │
│                      │       │                   │
│              REST polling  WebSocket             │
└──────────────────────┼───────────────────────────┘
                       │
               ClawOS API server
           (localhost or remote host)
```

**Data flow:** Frontend (React + React Three Fiber) → WebSocket API → ClawOS → Agent Data

| Layer | File | Role |
|-------|------|------|
| Scene | `scene/Office.jsx` | React Three Fiber canvas — floor, zones, avatars, lighting |
| Data | `hooks/useClawOS.js` | Polls REST + WebSocket for agents, runtimes, approvals, events |
| UI | `ui/HUD.jsx`, `ui/LiveFeed.jsx`, `ui/AvatarCard.jsx`, `ui/ConnectPanel.jsx` | HTML overlay — status bar, event stream, agent detail, connection screen |
| Demo | `lib/demo.js` | Simulated agent engine — no backend needed |

## Tech Stack

| Tech | Version | Why |
|------|---------|-----|
| React | 19 | UI framework |
| React Three Fiber | 9 | Declarative 3D — React components → Three.js scene |
| @react-three/drei | 10 | Camera controls, helpers, abstractions |
| @react-three/postprocessing | 3 | Bloom, vignette, film grain — cinematic feel |
| Three.js | 0.183 | Underlying 3D engine |
| Vite | 8 | Fast dev server and build tool |

## How to Run

### Prerequisites

- Node.js 18+
- A running [ClawOS](https://github.com/xbrxr03/clawos) instance (or use demo mode)

### Install & Run

```bash
git clone https://github.com/xbrxr03/nexus-hq.git
cd nexus-hq
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You'll see the connect panel:

- **Connect** — enter your ClawOS host URL (e.g. `http://localhost:8765`)
- **Demo Mode** — instantly loads simulated agents and events, no backend needed

### Build for Production

```bash
npm run build
```

Output goes to `dist/`. Serve it with any static host.

## What This Demonstrates

- **React** — component architecture, hooks, state management
- **3D Rendering** — Three.js scenes via React Three Fiber with post-processing
- **Real-Time Data** — WebSocket streaming and REST polling with live updates
- **API Integration** — connecting frontend to ClawOS agent runtime
- **Full-Stack Development** — end-to-end from 3D rendering to backend communication

## Part of ClawOS

Nexus HQ is part of [ClawOS](https://github.com/xbrxr03/clawos) — an agent-native OS that runs entirely offline with no API keys. The dashboard connects to ClawOS's REST + WebSocket API to render real-time agent activity.

## License

[MIT](LICENSE)