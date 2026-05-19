<div align="center">

# Nexus HQ

### 3D Real-Time Dashboard for AI Agents

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.183-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Live Demo:** https://nexus-hq-lake.vercel.app

**See your agents work. Not a log — a living office.**

Nexus HQ renders your local AI agents as animated avatars inside a 3D office environment. Connect it to [ClawOS](https://github.com/xbrxr03/clawos) and watch agents think, execute, and wait for approvals — all in real time.

> 🖼️ **Screenshots coming soon** — Nexus HQ is in active development.

</div>

---

## What It Does

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

**Key pieces:**

| Layer | File | Role |
|-------|------|------|
| Scene | `scene/Office.jsx` | React Three Fiber canvas — floor, zones, avatars, lighting |
| Data | `hooks/useClawOS.js` | Polls REST + WebSocket for agents, runtimes, approvals, events |
| UI | `ui/HUD.jsx`, `ui/LiveFeed.jsx`, `ui/AvatarCard.jsx`, `ui/ConnectPanel.jsx` | HTML overlay — status bar, event stream, agent detail, connection screen |
| Demo | `lib/demo.js` | Simulated agent engine — no backend needed |

## Getting Started

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

## Features in Detail

### Zones

Each runtime gets its own lit area in the office:

| Zone | Color | Runtime |
|------|-------|---------|
| Nexus | 🔵 Blue | Main agent sessions |
| PicoClaw | 🟡 Amber | Lightweight local worker |
| OpenClaw | 🟣 Violet | Distributed peer agents |

### Agent States

Avatars visually reflect what they're doing:

- **Idle** — sitting still, no active task
- **Active / Working** — animated, task in progress
- **Pending Approval** — highlighted, waiting for human input
- **Offline** — dimmed out

### Demo Mode

No ClawOS? No problem. Hit **Demo Mode** and watch simulated agents cycle through states, generate events, and move around the office. Perfect for screenshots, presentations, or just exploring.

## Tech Stack

| Tech | Version | Why |
|------|---------|-----|
| React | 19 | UI framework |
| React Three Fiber | 9 | Declarative 3D — React components → Three.js scene |
| @react-three/drei | 10 | Camera controls, helpers, abstractions |
| @react-three/postprocessing | 3 | Bloom, vignette, film grain — cinematic feel |
| Three.js | 0.183 | Underlying 3D engine |
| Vite | 8 | Fast dev server and build tool |

## Part of ClawOS

Nexus HQ is part of [ClawOS](https://github.com/xbrxr03/clawos) — an agent-native OS that runs entirely offline with no API keys. The dashboard connects to ClawOS's REST + WebSocket API to render real-time agent activity.

## License

[MIT](LICENSE)