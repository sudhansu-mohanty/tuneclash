# TuneClash — Claude Code Kickoff Prompts

A sequence of prompts to paste into Claude Code to scaffold the full project.
Run them in order. Each builds on the last.

---

## 1. Bootstrap the project

```
Scaffold a new Next.js 14 project called tuneclash with TypeScript, Tailwind CSS,
and App Router. Install @supabase/supabase-js and @supabase/ssr. Create the full
folder structure from CLAUDE.md including /app, /components, /lib, and /supabase/migrations.
Add a .env.local.example with the three env vars from CLAUDE.md. Do not add any auth libraries.
```

---

## 2. Set up Supabase schema

```
Create a Supabase SQL migration file at supabase/migrations/001_initial_schema.sql
that creates all four tables from CLAUDE.md: rooms, players, entries, and votes.
Include indexes on room_id foreign keys and a unique index on rooms.code.
Enable Row Level Security on all tables but keep policies permissive for now (allow all).
Also enable Realtime on the rooms, players, and votes tables.
```

---

## 3. Build the Supabase client helpers

```
Create /lib/supabase.ts with:
- A browser Supabase client using createBrowserClient from @supabase/ssr
- A server Supabase client using createServerClient
- TypeScript helper functions: createRoom, joinRoom, addEntry, submitVote, updateRoomStatus,
  setCurrentEntry, updatePlayerScore
Each helper should return typed data matching the schema in CLAUDE.md.
Also create /lib/types.ts with TypeScript interfaces for Room, Player, Entry, Vote.
```

---

## 4. Build the home screen

```
Build /app/page.tsx as a client component. It should have:
- A name input field
- A "Create room" button that calls the createRoom helper and redirects to /room/[code]
- A "Join with code" section with a 4-letter code input that calls joinRoom and redirects
- The TuneClash brand name and tagline "spin. guess. connect."
- Dark background (#0d0d0d), accent colour #ff5c3a, font Syne for headings and DM Sans for body
Import both fonts from next/font/google.
```

---

## 5. Build the lobby

```
Build /app/room/[code]/page.tsx. It should:
- Fetch the room and player list server-side on load
- Subscribe to the players Supabase Realtime channel client-side to show new joiners live
- Show the room code large and centred at the top
- Show a live player list with avatars (coloured initials circles)
- Show an "Add my pick" button → /room/[code]/add
- If the current user is the host, show a "Start game" button that sets rooms.status to spinning
- Subscribe to rooms Realtime channel and redirect all players to the spin view when status changes
```

---

## 6. Build the add-entry screen

```
Build /app/room/[code]/add/page.tsx as a client component with:
- A category selector grid (Music, Movies, Games, Books) — Music selected by default
- A title text input
- An optional creator/artist text input
- A submit button that calls addEntry and redirects back to /room/[code]
```

---

## 7. Build the roulette wheel

```
Build /components/RouletteWheel.tsx as a client component using HTML Canvas.
It should:
- Accept an entries array as a prop
- Render a coloured wheel with each entry as a segment (label truncated to 12 chars)
- Expose a spin() function via useImperativeHandle
- Animate with ease-out over ~3.5 seconds
- After spin completes, call an onLand(entry) callback with the selected entry
- Use the colour palette: #ff5c3a, #3a7bff, #22cc77, #ffcc3a, #cc44ff, #ff44aa, #44ddff, #ff9922
```

---

## 8. Build the spin + reveal + vote flow

```
Build the spin/reveal/vote section inside /app/room/[code]/page.tsx.
When rooms.status is "spinning":
- Show the RouletteWheel and a SPIN button (host only)
- On spin completion, host sets rooms.current_entry_id and status to "revealed"
When status is "revealed":
- All players see the RevealCard showing the entry title, creator, category badge
- Show a VotePanel: a grid of player name buttons — click to mark "loves this"
- Votes are written to the votes table in real time
- Show a "See matches" button (host only) that triggers scoring and sets status to "scoring"
When status is "scoring":
- Show MatchBars component: animated horizontal bars showing each player's match %
- Show Leaderboard component: ranked list by score with points pills
- Show "Next round" button (host only) that picks next unspun entry and sets status back to "spinning"
```

---

## 9. Wire up scoring

```
In /lib/game.ts, implement:
- calculateMatchPercent(votes: Vote[], totalPlayers: number): number
- updateScoresAfterRound(roomId: string, entryId: string): Promise<void>
  This should fetch all votes for the entry, increment score by 1 for each voter in the players table,
  and mark the entry as spun.
Call updateScoresAfterRound from the host client when transitioning to "scoring" status.
```

---

## 10. Final polish pass

```
Do a full review of the project and:
1. Make sure all Realtime subscriptions are cleaned up in useEffect return functions
2. Add loading states to all async actions (buttons should show a spinner while awaiting)
3. Add basic error handling — if Supabase calls fail, show a toast notification
4. Make the layout responsive and mobile-friendly (single column on small screens)
5. Add a /room/[code]/end page that shows the final leaderboard with confetti using canvas-confetti
```

---

## Useful one-off prompts (use anytime)

```
# Check the whole codebase for TypeScript errors and fix them
Run tsc --noEmit and fix all errors without changing any functionality.

# Add Supabase types
Run: npx supabase gen types typescript --local > lib/database.types.ts
Then update all helpers in /lib/supabase.ts to use the generated types.

# Debug realtime
The Supabase Realtime subscription for [rooms/players/votes] isn't firing.
Check the subscription setup in [file], verify the table has Realtime enabled,
and check that the channel filter matches the correct room_id.
```
