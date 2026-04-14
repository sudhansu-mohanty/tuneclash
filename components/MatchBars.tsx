"use client";

import type { Player, Vote } from "@/lib/types";
import { calculateMatchPercent } from "@/lib/game";

interface Props {
  players: Player[];
  votes: Vote[];
  category?: string;
}

export default function MatchBars({ players, votes, category }: Props) {
  const percent    = calculateMatchPercent(votes, players.length);
  const voterIds   = new Set(votes.map((v) => v.player_id));

  // Sort by who got the most votes first (matched → not matched)
  const sorted = [...players].sort((a, b) => {
    const aVoted = voterIds.has(a.id) ? 1 : 0;
    const bVoted = voterIds.has(b.id) ? 1 : 0;
    return bVoted - aVoted;
  });

  return (
    <div className="w-full space-y-6">
      {/* Header row */}
      <div className="flex justify-between items-end px-1">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#888888]">Round Breakdown</h2>
        {category && (
          <span className="text-sm font-bold text-[#E8FF47]">Category: {category}</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#1C1B1B] rounded-lg overflow-hidden border border-[#2A2A2A]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#464834]/10">
              <th className="py-4 px-5 text-[10px] text-[#888888] tracking-widest uppercase font-bold">Player</th>
              <th className="py-4 px-5 text-[10px] text-[#888888] tracking-widest uppercase font-bold text-right">Match</th>
              <th className="py-4 px-5 text-[10px] text-[#888888] tracking-widest uppercase font-bold text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#464834]/5">
            {sorted.map((player) => {
              const matched = voterIds.has(player.id);
              return (
                <tr key={player.id} className="hover:bg-[#2A2A2A] transition-colors">
                  <td className="py-4 px-5 text-sm font-medium text-[#F0F0F0]">{player.name}</td>
                  <td className="py-4 px-5 text-sm text-right font-bold" style={{ color: matched ? "#E8FF47" : "#888888" }}>
                    {matched ? "✓ Matched" : "—"}
                  </td>
                  <td className="py-4 px-5 text-sm text-right text-[#F0F0F0]">{player.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Overall match % */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#888888]">Overall Match</span>
        <span className="font-syne text-2xl font-bold text-[#E8FF47]">{percent}%</span>
      </div>
    </div>
  );
}
