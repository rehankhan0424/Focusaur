# Focusaur

Focusaur is a web app for practicing focus and attention through short cognitive games, with progress tracking and stats.

**Live demo:** <your-live-url>

## Features

- 8 focus games:
  - Schulte Table
  - Stroop Test
  - Arrow Stroop
  - Reaction Time
  - Memory Sequence
  - Number Memory
  - Visual Search
  - Continuous Performance
- Mindful Pacer (guided pacing exercise)
- Progress and stats views to track results over time
- Streak tracking and result summaries
- Sound effects with an on/off toggle
- Local sign-in profile

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Motion (animations) and lucide-react (icons)

## Getting started

Requires Node.js (LTS).

```bash
git clone https://github.com/<your-username>/focusaur.git
cd focusaur
npm install
npm run dev
```

The dev server runs at http://localhost:3000.

## Build for production

```bash
npm run build
npm run preview
```

The output is in `dist/` and can be hosted on any static host (Vercel, Netlify, Cloudflare Pages, Firebase Hosting).

## Data and privacy

All data (profile, stats, streaks, session history, sound setting) is stored in your browser's `localStorage`. Nothing is sent to a server, and clearing your browser data resets progress.

## Project structure

```
src/
  components/     UI, modals, and views
    games/        the 8 game components
  data/           game definitions
  services/       storage and sound engine
  types/          TypeScript types
```

## License

<choose one, e.g. MIT, or remove this section>
