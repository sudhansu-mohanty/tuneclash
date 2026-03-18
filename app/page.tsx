"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return setError("Enter your name first");
    setError(null);
    setCreating(true);
    try {
      const room = await createRoom(name.trim());
      // Also join as the host player
      await joinRoom(room.code, name.trim());
      sessionStorage.setItem("playerName", name.trim());
      sessionStorage.setItem("hostCode", room.code);
      router.push(`/room/${room.code}`);
    } catch (e) {
      setError(String(e));
      setCreating(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) return setError("Enter your name first");
    if (joinCode.trim().length !== 4) return setError("Enter a 4-letter room code");
    setError(null);
    setJoining(true);
    try {
      const { room, player } = await joinRoom(joinCode.trim(), name.trim());
      sessionStorage.setItem("playerName", name.trim());
      sessionStorage.setItem("playerId", player.id);
      router.push(`/room/${room.code}`);
    } catch (e) {
      setError(String(e));
      setJoining(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12 gap-10">
      {/* Brand */}
      <div className="text-center">
        <h1 className="font-syne text-6xl font-extrabold tracking-tight text-white">
          Tune<span className="text-accent">Clash</span>
        </h1>
        <p className="mt-2 text-zinc-400 text-lg font-dm tracking-widest uppercase text-sm">
          spin. guess. connect.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 flex flex-col gap-6 border border-zinc-800">
        {/* Name input */}
        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm font-medium">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex"
            maxLength={24}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Create room */}
        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full bg-accent hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-syne font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {creating ? <Spinner /> : "Create a room"}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-700" />
          <span className="text-zinc-500 text-sm">or</span>
          <div className="flex-1 h-px bg-zinc-700" />
        </div>

        {/* Join room */}
        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm font-medium">Join with code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="ABCD"
              maxLength={4}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 font-syne font-bold tracking-widest text-center text-xl uppercase focus:outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={handleJoin}
              disabled={joining}
              className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 rounded-xl transition-colors flex items-center justify-center"
            >
              {joining ? <Spinner /> : "Join"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
