# TuneClash — Claude Code Project Context

## What this is
A real-time browser-based icebreaker game. Players join a room via a 4-letter code,
submit their favourite music / movies / games / books, then spin a roulette wheel to
reveal picks one at a time. Other players vote on whether they share that taste.
The app tracks match scores and shows a leaderboard of most-connected players.

---

## Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Backend / DB**: Supabase (Postgres + Realtime subscriptions)
- **Auth**: None — players are anonymous, identified only by display name + room session
- **Deployment target**: Vercel

---

## Project structure
```
/app
  /page.tsx                  # Home screen (enter name, create/join room)
  /room/[code]/page.tsx      # Lobby + game screen (host and player view)
  /api/room/route.ts         # Room creation endpoint
  /api/entry/route.ts        # Add a pick endpoint
  /api/vote/route.ts         # Submit vote endpoint
/components
  /RoomLobby.tsx
  /RouletteWheel.tsx
  /RevealCard.tsx
  /VotePanel.tsx
  /MatchBars.tsx
  /Leaderboard.tsx
/lib
  /supabase.ts               # Supabase client (browser + server)
  /game.ts                   # Game logic helpers (score calc, match %)
  /types.ts                  # Shared TypeScript types
/supabase
  /migrations/               # SQL migration files
  /seed.sql                  # Optional demo data
```

---

## Supabase schema

### rooms
| column       | type      | notes                          |
|--------------|-----------|--------------------------------|
| id           | uuid PK   |                                |
| code         | text      | 4-letter uppercase, unique     |
| host_name    | text      |                                |
| status       | text      | lobby / spinning / revealed / done |
| current_entry_id | uuid  | FK → entries, nullable         |
| category     | text      | default category for the room  |
| created_at   | timestamp |                                |

### players
| column    | type    | notes               |
|-----------|---------|---------------------|
| id        | uuid PK |                     |
| room_id   | uuid FK |                     |
| name      | text    |                     |
| score     | int     | default 0           |
| joined_at | timestamp |                   |

### entries
| column    | type    | notes                              |
|-----------|---------|------------------------------------|
| id        | uuid PK |                                    |
| room_id   | uuid FK |                                    |
| player_id | uuid FK |                                    |
| title     | text    |                                    |
| creator   | text    | artist / director / studio etc     |
| category  | text    | music / movies / games / books     |
| spun      | bool    | default false                      |

### votes
| column    | type    | notes                       |
|-----------|---------|-----------------------------|
| id        | uuid PK |                             |
| entry_id  | uuid FK |                             |
| player_id | uuid FK |                             |
| room_id   | uuid FK |                             |

---

## Realtime subscriptions (Supabase)
Subscribe to these channels in the room page component:
- `rooms` — watch for `status` changes and `current_entry_id` updates
- `players` — watch for new players joining and score updates
- `votes` — watch for new votes on the current entry

All subscription setup lives in `/lib/supabase.ts`.

---

## Game flow
1. Host creates room → gets a 4-letter code
2. Players join via code → added to `players` table
3. Everyone adds picks → inserted into `entries`
4. Host hits "Start" → `rooms.status` = `spinning`
5. Wheel spins client-side using Canvas → on land, host confirms → `rooms.current_entry_id` updates
6. All players see the reveal and vote → `votes` rows inserted
7. After voting closes → scores updated, match bars shown
8. Repeat until all entries spun, or host ends game
9. Final leaderboard displayed

---

## Scoring logic (in `/lib/game.ts`)
- When a player votes on an entry, they earn 1 point
- Match % for an entry = (votes / total players) * 100
- Leaderboard ranks by total score descending

---

## Conventions
- TypeScript strict mode — no `any` types
- Server components by default; `"use client"` only for interactive components
- All Supabase DB access goes through `/lib/supabase.ts` helpers
- All game logic (score calc, match %) lives in `/lib/game.ts`
- Keep API routes thin — validate input, call a helper, return JSON
- Tailwind only for styling — no inline styles, no CSS modules
- Commit messages: imperative mood, under 72 chars

---

## Commands
```bash
npm run dev       # Start dev server on port 3000
npm run build     # Production build
npm run lint      # ESLint
npx supabase start          # Start local Supabase
npx supabase db push        # Push migrations
npx supabase gen types typescript --local > lib/database.types.ts
```

---

## Environment variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## What NOT to do
- Do not add authentication/login — the game is anonymous by design
- Do not use `useEffect` for data that can be fetched server-side
- Do not store game state in localStorage — Supabase is the source of truth
- Do not use Socket.io — Supabase Realtime handles all live updates
