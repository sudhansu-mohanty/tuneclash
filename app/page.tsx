"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/lib/supabase";

const CATEGORIES = [
  { id: "music",  label: "Music",  icon: "♫", hover: "hover:border-accent hover:bg-accent/10 hover:text-accent",             active: "border-accent bg-accent/10 text-accent" },
  { id: "movies", label: "Movies", icon: "▶", hover: "hover:border-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue", active: "border-accent-blue bg-accent-blue/10 text-accent-blue" },
  { id: "games",  label: "Games",  icon: "◈", hover: "hover:border-accent-green hover:bg-accent-green/10 hover:text-accent-green", active: "border-accent-green bg-accent-green/10 text-accent-green" },
  { id: "books",  label: "Books",  icon: "◉", hover: "hover:border-accent-yellow hover:bg-accent-yellow/10 hover:text-accent-yellow", active: "border-accent-yellow bg-accent-yellow/10 text-accent-yellow" },
];

export default function HomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [tab, setTab] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGo() {
    if (!name.trim()) return setError("Enter your name");
    if (tab === "join" && joinCode.trim().length !== 4) return setError("Enter a 4-letter room code");
    if (!selected) return setError("Pick a category first");
    setError(null);
    setLoading(true);
    try {
      if (tab === "create") {
        const room = await createRoom(name.trim(), selected);
        await joinRoom(room.code, name.trim());
        sessionStorage.setItem("playerName", name.trim());
        sessionStorage.setItem("hostCode", room.code);
        router.push(`/room/${room.code}`);
      } else {
        const { room, player } = await joinRoom(joinCode.trim(), name.trim());
        sessionStorage.setItem("playerName", name.trim());
        sessionStorage.setItem("playerId", player.id);
        router.push(`/room/${room.code}`);
      }
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col divide-y divide-zinc-800/60">

      {/* ── Section 1: What it is ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
        <p className="text-xs font-syne tracking-[0.25em] uppercase text-zinc-600 mb-5">
          real-time · multiplayer · icebreaker
        </p>
        <h1 className="font-syne text-6xl sm:text-8xl font-extrabold tracking-tight text-white leading-none">
          Tune<span className="text-accent">Clash</span>
        </h1>
        <p className="mt-6 text-zinc-400 text-lg sm:text-xl max-w-lg leading-relaxed">
          Everyone submits their favourite picks. A roulette wheel reveals them
          one by one. Vote if you share the taste — find out who vibes with you.
        </p>
        <div className="mt-12 flex items-center gap-6 sm:gap-10">
          <Step n="1" label="Drop your picks" />
          <div className="w-8 h-px bg-zinc-800" />
          <Step n="2" label="Spin the wheel" />
          <div className="w-8 h-px bg-zinc-800" />
          <Step n="3" label="Vote & match" />
        </div>
      </section>

      {/* ── Section 2: Pick category + start ── */}
      <section className="flex flex-col items-center px-6 py-20 gap-10">
        <div className="text-center">
          <h2 className="font-syne text-2xl sm:text-3xl font-bold text-white">
            What are you clashing on?
          </h2>
          <p className="text-zinc-600 text-sm mt-1">Pick a category to get started</p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelected(cat.id); setError(null); }}
              className={`flex flex-col items-center gap-3 py-8 rounded-2xl border-2 transition-all duration-150 font-syne font-bold text-sm
                ${selected === cat.id
                  ? cat.active
                  : `border-zinc-800 bg-zinc-900/50 text-zinc-500 ${cat.hover}`}`}
            >
              <span className="text-3xl">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Name + create/join — slides in after category is picked */}
        {selected && (
          <div className="w-full max-w-sm flex flex-col gap-4">
            {/* Tab */}
            <div className="flex rounded-xl overflow-hidden border border-zinc-800">
              {(["create", "join"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(null); }}
                  className={`flex-1 py-2.5 text-sm font-syne font-bold transition-colors
                    ${tab === t ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  {t === "create" ? "Create room" : "Join room"}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGo()}
              placeholder="Your name"
              maxLength={24}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />

            {tab === "join" && (
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                onKeyDown={(e) => e.key === "Enter" && handleGo()}
                placeholder="Room code · ABCD"
                maxLength={4}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 font-syne font-bold tracking-[0.3em] text-center text-lg uppercase focus:outline-none focus:border-zinc-600 transition-colors"
              />
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              onClick={handleGo}
              disabled={loading}
              className="w-full bg-accent hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-syne font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Spinner /> : tab === "create" ? "Create room →" : "Join →"}
            </button>
          </div>
        )}
      </section>

    </main>
  );
}

function Step({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="w-8 h-8 rounded-full border border-zinc-800 text-zinc-600 text-xs font-syne font-bold flex items-center justify-center">
        {n}
      </span>
      <span className="text-zinc-600 text-xs whitespace-nowrap">{label}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
