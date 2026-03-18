"use client";

import { useEffect, useState } from "react";
import type { Player, Vote } from "@/lib/types";
import { calculateMatchPercent } from "@/lib/game";

interface Props {
  players: Player[];
  votes: Vote[];
}

export default function MatchBars({ players, votes }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const percent = calculateMatchPercent(votes, players.length);
  const voterIds = new Set(votes.map((v) => v.player_id));

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-syne font-bold text-white">Match results</h3>
        <span className="text-accent font-bold text-xl">{percent}%</span>
      </div>
      <div className="flex flex-col gap-3">
        {players.map((player) => {
          const matched = voterIds.has(player.id);
          return (
            <div key={player.id} className="flex items-center gap-3">
              <span className="text-sm text-zinc-300 w-24 truncate">
                {player.name}
              </span>
              <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    matched ? "bg-accent" : "bg-zinc-600"
                  }`}
                  style={{ width: animated ? (matched ? "100%" : "15%") : "0%" }}
                />
              </div>
              <span className="text-xs text-zinc-500 w-6">
                {matched ? "✓" : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
