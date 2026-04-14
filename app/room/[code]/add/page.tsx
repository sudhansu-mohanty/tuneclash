"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const CATEGORIES = [
  { id: "music",  label: "Music",  icon: "music_note",    color: "#C97B84" },
  { id: "movies", label: "Movies", icon: "movie",          color: "#6B8CAE" },
  { id: "games",  label: "Games",  icon: "sports_esports", color: "#7AAE8C" },
  { id: "books",  label: "Books",  icon: "menu_book",      color: "#C4A882" },
];

const PLACEHOLDERS: Record<string, { title: string; creator: string; creatorLabel: string }> = {
  music:  { title: "e.g. Bohemian Rhapsody",     creator: "e.g. Queen",             creatorLabel: "Artist" },
  movies: { title: "e.g. Inception",             creator: "e.g. Christopher Nolan", creatorLabel: "Director" },
  games:  { title: "e.g. The Last of Us",        creator: "e.g. Naughty Dog",       creatorLabel: "Studio" },
  books:  { title: "e.g. Dune",                  creator: "e.g. Frank Herbert",     creatorLabel: "Author" },
};

export default function AddEntryPage() {
  const params = useParams();
  const code   = (params.code as string).toUpperCase();
  const router = useRouter();

  const [category,   setCategory]   = useState("music");
  const [title,      setTitle]      = useState("");
  const [creator,    setCreator]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // Lock category to whatever the host set on room creation
  useEffect(() => {
    const supabase = createClient();
    supabase.from("rooms").select("category").eq("code", code).single()
      .then(({ data }) => { if (data?.category) setCategory(data.category); });
  }, [code]);

  async function handleSubmit() {
    if (!title.trim()) return setError("Enter a title");
    setError(null);
    setSubmitting(true);
    try {
      const supabase   = createClient();
      const playerName = sessionStorage.getItem("playerName") ?? "";

      const { data: room, error: roomErr } = await supabase
        .from("rooms").select("id").eq("code", code).single();
      if (roomErr || !room) throw new Error("Room not found");

      const { data: player, error: playerErr } = await supabase
        .from("players").select("id").eq("room_id", room.id).eq("name", playerName).single();
      if (playerErr || !player) throw new Error("Player not found");

      const { error: entryErr } = await supabase.from("entries").insert({
        room_id:   room.id,
        player_id: player.id,
        title:     title.trim(),
        category,
        creator:   creator.trim() || null,
      });
      if (entryErr) throw entryErr;

      router.push(`/room/${code}`);
    } catch (e) {
      setError(String(e));
      setSubmitting(false);
    }
  }

  const ph      = PLACEHOLDERS[category];
  const catStyle = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#111111] flex items-center gap-4 px-6 h-16">
        <button
          onClick={() => router.push(`/room/${code}`)}
          className="text-[#555] active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="font-syne font-bold tracking-tighter text-lg text-[#F0F0F0] uppercase">Add Pick</span>
      </header>

      <main className="flex-1 pt-20 pb-24 px-6 max-w-[480px] mx-auto w-full">
        <div className="space-y-7 pt-4">

          {/* Page title */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#555]">Submission</span>
            <h1 className="font-syne text-3xl font-bold tracking-tight text-[#F0F0F0] mt-1">
              What are you obsessed with?
            </h1>
          </div>

          {/* Category — locked to room setting */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#555] block mb-2.5">
              Category
            </label>
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{
                color: catStyle.color,
                backgroundColor: catStyle.color + "18",
                border: `1px solid ${catStyle.color}50`,
              }}
            >
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {catStyle.icon}
              </span>
              {catStyle.label}
              <span className="ml-1 text-[#555] normal-case tracking-normal font-normal">· set by host</span>
            </div>
          </div>

          {/* Input card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#191919",
              border: `1px solid ${catStyle.color}25`,
              borderTop: `2px solid ${catStyle.color}50`,
            }}
          >
            <div className="p-6 space-y-5">

              {/* Title */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#555]">Title</label>
                  <span className="text-[10px] text-[#333] font-mono">{title.length}/80</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={ph.title}
                  maxLength={80}
                  className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3.5 text-[#F0F0F0] placeholder-[#333] focus:outline-none transition-all text-sm"
                  style={{ outline: "none" }}
                  onFocus={(e) => e.target.style.borderColor = catStyle.color + "50"}
                  onBlur={(e) => e.target.style.borderColor = "#2A2A2A"}
                />
              </div>

              {/* Creator */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#555] block mb-2">
                  {ph.creatorLabel}
                  <span className="ml-2 text-[#333]">optional</span>
                </label>
                <input
                  type="text"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={ph.creator}
                  maxLength={80}
                  className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3.5 text-[#F0F0F0] placeholder-[#333] focus:outline-none transition-all text-sm"
                />
              </div>

            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs flex items-center gap-1.5 px-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="w-full font-syne font-bold py-4 rounded-xl text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#E8FF47", color: "#2D3400" }}
          >
            {submitting ? <Spinner /> : (
              <>
                Submit Pick
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </>
            )}
          </button>

        </div>
      </main>
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
