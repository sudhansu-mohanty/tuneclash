"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Leaderboard from "@/components/Leaderboard";
import type { Player } from "@/lib/types";

export default function EndPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let confettiCleanup: (() => void) | null = null;

    async function load() {
      const supabase = createClient();
      const { data: room } = await supabase
        .from("rooms")
        .select("id")
        .eq("code", code)
        .single();

      if (room) {
        const { data } = await supabase
          .from("players")
          .select()
          .eq("room_id", room.id)
          .order("score", { ascending: false });
        setPlayers((data ?? []) as Player[]);
      }
      setLoading(false);
    }

    load();

    // Fire confetti after load
    const t = setTimeout(async () => {
      const confetti = (await import("canvas-confetti")).default;
      const end = Date.now() + 3000;

      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
          colors: ["#ff5c3a", "#3a7bff", "#22cc77", "#ffcc3a", "#cc44ff"],
        });
      }, 200);

      confettiCleanup = () => clearInterval(interval);
    }, 500);

    return () => {
      clearTimeout(t);
      if (confettiCleanup) confettiCleanup();
    };
  }, [code]);

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-12 gap-8">
      <div className="text-center">
        <h1 className="font-syne text-5xl font-extrabold text-white">
          Game <span className="text-accent">Over!</span>
        </h1>
        <p className="text-zinc-400 mt-2">Here&apos;s how the vibes stacked up</p>
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading results…</div>
      ) : (
        <Leaderboard players={players} />
      )}

      <button
        onClick={() => router.push("/")}
        className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
      >
        Play again
      </button>
    </main>
  );
}
