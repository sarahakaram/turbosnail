# Wild Growth — Leader Dashboard

Know yourself deeply. Organize your energy intentionally. Lead your team with clarity.

Wild Growth helps leaders discover their growth pattern species, then generates personalized daily rituals — morning intentions, energy-aware schedules, coaching nudges, and evening reflections — all shaped by how you actually process the world.

## Getting Started

### Prerequisites
- Node.js 18+
- An Anthropic API key

### Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
npm run dev
```

The app will be running at `http://localhost:3000`.

## Tech Stack
- **Frontend:** React + Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** SQLite (via better-sqlite3)
- **AI:** Anthropic Claude API

## Features (v1)
- **Species Discovery** — AI-guided conversational interview to discover your growth pattern
- **Daily Dashboard** — Personalized morning ritual and evening review
- **Profile Management** — Species card, chronotype, priorities, core values
- **Team Species Map** — Visual map of team species composition
- **Friction Analysis** — AI-powered team dynamics analysis
- **Team Ritual Generator** — Standup, check-in, and retrospective prompts

## The Seven Species
- 🌳 Baobab — Internal & Deep
- 🌿 Mangrove — External & Visible
- 🎋 Bamboo — Hyper-Focused
- 🪴 Strangler Fig — Scaffolded
- 🌾 Willow — Adaptive
- 🌲 Oak — Structured
- 🌱 Aspen Grove — Distributed
