"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Leaderboard from "@/components/Leaderboard";
import BottomNav from "@/components/BottomNav";
import type { Player } from "@/lib/types";

export default function EndPage() {
  const params  = useParams();
  const code    = (params.code as string).toUpperCase();
  const router  = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    async function load() {
      const supabase = createClient();
      const { data: room } = await supabase.from("rooms").select("id").eq("code", code).single();
      if (room) {
        const { data } = await supabase.from("players").select().eq("room_id", room.id).order("score", { ascending: false });
        setPlayers((data ?? []) as Player[]);
      }
      setLoading(false);
    }
    load();

    const t = setTimeout(async () => {
      const confetti = (await import("canvas-confetti")).default;
      const end = Date.now() + 3000;
      const interval = setInterval(() => {
        if (Date.now() > end) { clearInterval(interval); return; }
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
          colors: ["#E8FF47", "#C97B84", "#6B8CAE", "#7AAE8C", "#C4A882"],
        });
      }, 200);
      cleanup = () => clearInterval(interval);
    }, 500);

    return () => { clearTimeout(t); if (cleanup) cleanup(); };
  }, [code]);

  const winner = players[0];

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">

      {/* Decorative glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#E8FF47] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#353534] blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#111111] flex justify-between items-center px-6 h-16">
        <span className="font-syne text-xl font-bold tracking-tighter text-[#F0F0F0] uppercase">TuneClash</span>
        <span className="material-symbols-outlined text-[#888888]">menu</span>
      </header>

      <main className="flex-1 pt-24 pb-32 px-6 max-w-[480px] mx-auto w-full">

        {loading ? (
          <div className="flex items-center justify-center pt-20">
            <span className="text-[#888888] text-sm">Loading results…</span>
          </div>
        ) : (
          <div className="space-y-12">

            {/* Winner display */}
            {winner && (
              <section className="text-center space-y-4 mt-4">
                <div className="inline-flex flex-col items-center">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                    style={{ background: "#E8FF47", boxShadow: "0 0 0 4px rgba(232,255,71,0.2)" }}
                  >
                    <span className="font-syne text-4xl font-bold text-[#2D3400]">
                      {winner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-2">The Correct Answer</p>
                  <h1 className="font-syne text-5xl font-bold tracking-tighter text-[#F0F0F0]">
                    {winner.name.toUpperCase()}
                  </h1>
                </div>
              </section>
            )}

            {/* Final standings */}
            <Leaderboard players={players} />

          </div>
        )}
      </main>

      {/* Play again — fixed FAB style */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={() => router.push("/")}
          className="bg-[#E8FF47] text-[#2D3400] px-8 py-4 rounded-lg font-syne font-bold text-sm tracking-widest flex items-center gap-2 active:scale-95 transition-transform"
        >
          PLAY AGAIN
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>

      <BottomNav active="lobby" />
    </div>
  );
}
