"use client";

import type { Player, Vote } from "@/lib/types";

interface Props {
  players: Player[];
  votes: Vote[];
  myPlayerId: string;
  onVote: (playerId: string) => void;
}

export default function VotePanel({ players, votes, myPlayerId, onVote }: Props) {
  const votedPlayerIds = new Set(votes.map((v) => v.player_id));
  const myVoted = votedPlayerIds.has(myPlayerId);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3">
      <p className="text-zinc-400 text-sm text-center">
        Who else loves this?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {players.map((player) => {
          const voted = votedPlayerIds.has(player.id);
          const isMe = player.id === myPlayerId;

          return (
            <button
              key={player.id}
              onClick={() => !isMe && !myVoted && onVote(player.id)}
              disabled={isMe || myVoted}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                voted
                  ? "border-accent bg-accent/10 text-accent"
                  : isMe
                  ? "border-zinc-700 bg-zinc-800/50 text-zinc-500 cursor-default"
                  : myVoted
                  ? "border-zinc-700 bg-zinc-800/50 text-zinc-400 cursor-not-allowed"
                  : "border-zinc-700 bg-zinc-800 text-white hover:border-accent hover:bg-accent/10"
              }`}
            >
              <Avatar name={player.name} size="sm" />
              <span className="text-sm font-medium truncate">{player.name}</span>
              {voted && (
                <span className="ml-auto text-accent text-xs">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Avatar({ name, size }: { name: string; size: "sm" | "md" }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    "bg-accent",
    "bg-accent-blue",
    "bg-accent-green",
    "bg-accent-purple",
    "bg-accent-pink",
    "bg-accent-yellow",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  return (
    <span
      className={`${color} ${sizeClass} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
    >
      {initial}
    </span>
  );
}
