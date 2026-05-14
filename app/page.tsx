"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRoom, joinRoom } from "@/lib/supabase";
import { DottedSurface } from "@/components/ui/dotted-surface";

function IntroOverlay({ onDone }: { onDone: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-[#111111] flex flex-col items-center justify-center animate-intro-exit"
      onAnimationEnd={onDone}
    >
      <div className="animate-intro-word">
        <span className="font-syne text-[4rem] sm:text-[6rem] font-bold tracking-tight text-[#F0F0F0]">
          Who fits
        </span>
      </div>
      <div className="animate-intro-sub">
        <span className="font-syne text-[4rem] sm:text-[6rem] font-bold tracking-tight text-[#E8FF47]">
          your taste?
        </span>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { id: "music",  label: "Music",  icon: "music_note",      color: "#C97B84" },
  { id: "movies", label: "Movies", icon: "movie",            color: "#6B8CAE" },
  { id: "games",  label: "Games",  icon: "sports_esports",   color: "#7AAE8C" },
  { id: "books",  label: "Books",  icon: "menu_book",        color: "#C4A882" },
];

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab]           = useState<"create" | "join">("create");
  const [name, setName]         = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [modal, setModal]       = useState(false);

  async function handleGo() {
    if (!name.trim()) return setError("Enter your name");
    if (tab === "join" && joinCode.trim().length !== 4) return setError("Enter a 4-letter room code");
    if (tab === "create" && !selected) return setError("Pick a category first");
    setError(null);
    setLoading(true);
    try {
      if (tab === "create") {
        const room = await createRoom(name.trim(), selected!);
        await joinRoom(room.code, name.trim());
        sessionStorage.setItem("playerName", name.trim());
        sessionStorage.setItem("hostCode", room.code);
        router.push(`/room/${room.code}`);
      } else {
        const { room, player } = await joinRoom(joinCode.trim().toUpperCase(), name.trim());
        sessionStorage.setItem("playerName", name.trim());
        sessionStorage.setItem("playerId", player.id);
        router.push(`/room/${room.code}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }

  return (
    <>
      {showIntro && <IntroOverlay onDone={() => setShowIntro(false)} />}
    <div className="min-h-screen bg-[#111111] flex flex-col animate-page-reveal">
      <DottedSurface />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/whofits.svg" alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
          <span className="font-syne text-lg font-bold tracking-tighter text-[#F0F0F0] uppercase">WhoFits</span>
        </Link>
        <nav className="flex items-center gap-0.5">
          <button
            onClick={() => setModal(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#F0F0F0] transition-colors px-3 py-1.5"
          >
            How to Play
          </button>
          <span className="text-[#2A2A2A] text-xs select-none">·</span>
          <a
            href="https://www.sudhansumohanty.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#E8FF47] transition-colors px-3 py-1.5 flex items-center gap-1"
          >
            Sudhansu here!
            <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>open_in_new</span>
          </a>
        </nav>
      </header>

      <main className="flex-1 pt-20 pb-16 px-6 lg:px-16 xl:px-24 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:min-h-[calc(100vh-5rem)] gap-8 lg:gap-16 xl:gap-24 pt-8 lg:pt-0">

        {/* Left — Hero */}
        <section className="lg:flex-1 animate-fade-up space-y-6">
          <h1 className="font-syne text-[3.75rem] sm:text-[5rem] lg:text-[7rem] xl:text-[9rem] leading-[0.88] font-bold tracking-tight">
            <span className="text-[#F0F0F0]">Your taste.</span><br />
            <span className="text-[#E8FF47]">Exposed.</span>
          </h1>

          <p className="text-[#555] text-sm lg:text-base leading-relaxed max-w-xs lg:max-w-sm">
            Submit your favourite. Your friends guess whose it is.
            Score points for bluffing them.
          </p>

          <div className="hidden lg:flex flex-wrap gap-2 pt-2">
            {CATEGORIES.map((cat) => (
              <span
                key={cat.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                style={{ color: cat.color, borderColor: cat.color + "30", backgroundColor: cat.color + "10" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>{cat.icon}</span>
                {cat.label}
              </span>
            ))}
          </div>
        </section>

        {/* Right — Form */}
        <div className="lg:w-[420px] xl:w-[460px] shrink-0 flex flex-col gap-5">

        {/* Pill toggle */}
        <div className="animate-fade-up-delay-1">
          <div className="flex bg-[#1C1B1B] rounded-full p-1 border border-[#2A2A2A] w-fit">
            <button
              onClick={() => { setTab("create"); setError(null); }}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                tab === "create"
                  ? "bg-[#E8FF47] text-[#2D3400]"
                  : "text-[#555] hover:text-[#F0F0F0]"
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => { setTab("join"); setError(null); }}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                tab === "join"
                  ? "bg-[#E8FF47] text-[#2D3400]"
                  : "text-[#555] hover:text-[#F0F0F0]"
              }`}
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Form card */}
        <section className="animate-fade-up-delay-2 lg:animate-none">
          <div
            className="rounded-2xl border border-[#2A2A2A] overflow-hidden"
            style={{ background: "#191919", borderTop: "2px solid rgba(232,255,71,0.18)" }}
          >
            <div className="p-6 space-y-5">

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#555] mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGo()}
                  placeholder="What should we call you?"
                  maxLength={24}
                  className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3.5 text-[#F0F0F0] placeholder-[#383838] focus:outline-none focus:border-[#E8FF47]/30 transition-all text-sm"
                />
              </div>

              {/* Join code */}
              {tab === "join" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#555] mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                    onKeyDown={(e) => e.key === "Enter" && handleGo()}
                    placeholder="ABCD"
                    maxLength={4}
                    className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3.5 text-[#E8FF47] placeholder-[#333] focus:outline-none focus:border-[#E8FF47]/30 transition-all font-mono font-bold tracking-[0.5em] text-center text-2xl uppercase"
                  />
                </div>
              )}

              {/* Category — create only */}
              {tab === "create" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#555] mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => {
                      const isActive = selected === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => { setSelected(cat.id); setError(null); }}
                          className="flex flex-col items-center gap-2 py-5 rounded-xl transition-all duration-200 active:scale-95"
                          style={isActive ? {
                            color: cat.color,
                            backgroundColor: cat.color + "15",
                            border: `1px solid ${cat.color}50`,
                          } : {
                            color: "#444",
                            backgroundColor: "#111111",
                            border: "1px solid #2A2A2A",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: "24px",
                              color: isActive ? cat.color : "#3A3A3A",
                              fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
                            }}
                          >
                            {cat.icon}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && (
                <p className="text-red-400 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {error}
                </p>
              )}

              <button
                onClick={handleGo}
                disabled={loading}
                className="w-full bg-[#E8FF47] text-[#2D3400] font-syne font-bold py-4 rounded-xl text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Spinner /> : (
                  <>
                    {tab === "create" ? "Create Room" : "Join Room"}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>

            </div>
          </div>
        </section>

        {/* Footer hint */}
        <p className="text-[10px] text-[#333] text-center uppercase tracking-widest animate-fade-up-delay-3 pt-2">
          Music · Movies · Games · Books
        </p>

        </div>{/* end right col */}
        </div>{/* end flex row */}
      </main>
    </div>

      {/* How to Play modal */}
      {modal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          onClick={() => setModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative rounded-2xl border border-[#2A2A2A] bg-[#191919] max-w-sm w-full p-6 animate-fade-up"
            style={{ borderTop: "2px solid rgba(232,255,71,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModal(false)}
              className="absolute top-4 right-4 text-[#555] hover:text-[#F0F0F0] transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
            </button>
            <div className="space-y-4">
              <h2 className="font-syne font-bold text-xl text-[#F0F0F0]">How to Play</h2>
              <div className="space-y-3">
                {[
                  ["create_new_folder", "Create a room",    "Choose a category, enter your name, hit Create Room. Share the 4-letter code with friends."],
                  ["group_add",         "Everyone joins",   "Friends open the app, enter the code and a display name — no account needed."],
                  ["library_music",     "Submit your pick", "Each player types their favourite title. Keep it secret until the reveal!"],
                  ["casino",            "Spin the wheel",   "Host hits Start. The roulette spins and lands on a random pick."],
                  ["how_to_vote",       "Vote",             "The pick is revealed anonymously. Tap vote if you share that taste — each vote earns 1 point."],
                  ["leaderboard",       "Leaderboard",      "After all picks are spun the player with the most connections wins."],
                ].map(([icon, title, desc]) => (
                  <div key={icon} className="flex gap-3">
                    <span className="material-symbols-outlined text-[#E8FF47] shrink-0" style={{ fontSize: "18px", marginTop: "1px" }}>{icon}</span>
                    <div>
                      <p className="text-xs font-bold text-[#F0F0F0] uppercase tracking-widest mb-0.5">{title}</p>
                      <p className="text-xs text-[#666] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
