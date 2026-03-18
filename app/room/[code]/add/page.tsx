"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const CATEGORIES = [
  { id: "music", label: "🎵 Music", color: "border-accent bg-accent/10 text-accent" },
  { id: "movies", label: "🎬 Movies", color: "border-accent-blue bg-accent-blue/10 text-accent-blue" },
  { id: "games", label: "🎮 Games", color: "border-accent-green bg-accent-green/10 text-accent-green" },
  { id: "books", label: "📚 Books", color: "border-accent-yellow bg-accent-yellow/10 text-accent-yellow" },
];

export default function AddEntryPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const router = useRouter();

  const [category, setCategory] = useState("music");
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) return setError("Enter a title");
    setError(null);
    setSubmitting(true);

    try {
      const supabase = createClient();
      const playerName = sessionStorage.getItem("playerName") ?? "";

      // Get room
      const { data: room, error: roomErr } = await supabase
        .from("rooms")
        .select("id")
        .eq("code", code)
        .single();
      if (roomErr || !room) throw new Error("Room not found");

      // Get player
      const { data: player, error: playerErr } = await supabase
        .from("players")
        .select("id")
        .eq("room_id", room.id)
        .eq("name", playerName)
        .single();
      if (playerErr || !player) throw new Error("Player not found");

      const { error: entryErr } = await supabase.from("entries").insert({
        room_id: room.id,
        player_id: player.id,
        title: title.trim(),
        category,
        creator: creator.trim() || null,
      });
      if (entryErr) throw entryErr;

      router.push(`/room/${code}`);
    } catch (e) {
      setError(String(e));
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div>
          <button
            onClick={() => router.push(`/room/${code}`)}
            className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors mb-4"
          >
            ← Back
          </button>
          <h1 className="font-syne text-3xl font-extrabold text-white">
            Add your pick
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            What are you obsessed with?
          </p>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm font-medium">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  category === cat.id
                    ? cat.color
                    : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              category === "music"
                ? "e.g. Bohemian Rhapsody"
                : category === "movies"
                ? "e.g. Inception"
                : category === "games"
                ? "e.g. The Last of Us"
                : "e.g. Dune"
            }
            maxLength={80}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Creator */}
        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm font-medium">
            {category === "music"
              ? "Artist"
              : category === "movies"
              ? "Director"
              : category === "games"
              ? "Studio"
              : "Author"}{" "}
            <span className="text-zinc-600">(optional)</span>
          </label>
          <input
            type="text"
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            placeholder={
              category === "music"
                ? "e.g. Queen"
                : category === "movies"
                ? "e.g. Christopher Nolan"
                : category === "games"
                ? "e.g. Naughty Dog"
                : "e.g. Frank Herbert"
            }
            maxLength={80}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-accent hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-syne font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? <Spinner /> : "Submit pick"}
        </button>
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
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
