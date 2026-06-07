# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server (webpack mode) at localhost:3000
npm run build    # Production build
npm run start    # Start production server
```

No test suite or linting is currently configured.

## What this project is

**Dribl** is a mobile-first Next.js 16 app (App Router, TypeScript) for football/soccer ball-touch training. It uses the device camera and TensorFlow.js to detect and count ball touches in real time via computer vision. The UI is in Catalan.

## Architecture

```
src/
├── app/
│   ├── layout.tsx              Root layout and metadata
│   ├── page.tsx                Home/menu — lists levels with unlock state
│   └── level/[id]/page.tsx     Dynamic level page — stages: demo → exercise
├── components/
│   ├── ExerciseCamera.tsx      Game loop UI (countdown → playing → result)
│   └── VideoDemo.tsx           YouTube embed + instructions screen
├── data/
│   └── levels.ts               Level definitions (Level interface + LEVELS array)
└── hooks/
    └── useBallTouchDetector.ts  Core AI logic
```

### Data model

`src/data/levels.ts` defines the `Level` interface and the `LEVELS` array. Each level has `targetCount`, `timeLimit`, `difficulty`, and optional `youtubeId` for the demo video.

### Level flow

`/level/[id]` manages a two-stage state: first the **demo** stage (VideoDemo component, YouTube iframe or placeholder), then the **exercise** stage (ExerciseCamera component). Level unlock state is currently hardcoded — only Level 1 is unlocked.

### Game loop (`ExerciseCamera.tsx`)

Phases: `loading → countdown → playing → success | timeout`. Renders a `<canvas>` overlay on top of the camera `<video>` element. Cleans up media streams and `requestAnimationFrame` handles on unmount.

### AI detection (`useBallTouchDetector.ts`)

Loads two TensorFlow.js models on first use (WebGL backend):
- **COCO-SSD** (`lite_mobilenet_v2`) — detects the sports ball, threshold 0.4
- **MoveNet SINGLEPOSE_LIGHTNING** — extracts foot keypoints (indices 15–18: ankles and feet tips)

**Touch registration logic:** ball within 0.18 normalised-coordinate units of a foot keypoint for 2+ consecutive frames, then moves away → touch counted. 500 ms cooldown between touches to prevent double-counting.

Canvas visualisation: green circle = ball, blue circles = feet, amber flash on touch.

## Key config

- Path alias `@/*` → `./src/*`
- Tailwind custom colours: `pitch.*` (greens) and `brand.*` (gold/orange)
- `next.config.js` disables Node built-ins (`fs`, `path`, `crypto`) via webpack fallbacks for browser compatibility with TensorFlow.js
- Camera uses `facingMode: "environment"` (rear camera on mobile)
