"use client";

import { useState } from "react";
import type { Player, Vote } from "@/lib/types";

interface Props {
  players: Player[];
  votes: Vote[];
  myPlayerId: string;
  onVote: (playerId: string) => void;
  entryTitle?: string;
}

const AVATAR_COLORS = ["#C97B84", "#6B8CAE", "#7AAE8C", "#C4A882"];

function avatarColor(name: string): string {
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function VotePanel({ players, votes, myPlayerId, onVote, entryTitle }: Props) {
  const votedPlayerIds = new Set(votes.map((v) => v.player_id));
  const myVoted        = votedPlayerIds.has(myPlayerId);
  const [selected, setSelected] = useState<string | null>(null);

  function handleLockIn() {
    if (!selected || myVoted) return;
    onVote(selected);
    setSelected(null);
  }

  return (
    <div className="w-full flex flex-col gap-5">

      {/* Prompt */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8FF47]">Your Vote</span>
        <h2 className="font-syne text-xl font-bold tracking-tight text-[#F0F0F0] leading-snug">
          Who submitted{" "}
          <span className="italic text-[#E8FF47]">
            {entryTitle ? `"${entryTitle}"` : "this pick"}
          </span>
          ?
        </h2>
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-2 gap-3">
        {players.map((player) => {
          const hasVoted   = votedPlayerIds.has(player.id);
          const isMe       = player.id === myPlayerId;
          const isSelected = selected === player.id;
          const color      = avatarColor(player.name);

          let borderColor = "#2A2A2A";
          let bgColor = "#161616";
          let nameColor = "#888";

          if (isSelected) {
            borderColor = "#E8FF47";
            bgColor = "rgba(232,255,71,0.05)";
            nameColor = "#E8FF47";
          } else if (hasVoted) {
            borderColor = color + "50";
            bgColor = color + "0A";
            nameColor = color;
          } else if (isMe) {
            bgColor = "#111111";
            nameColor = "#333";
          }

          return (
            <button
              key={player.id}
              onClick={() => {
                if (isMe || myVoted) return;
                setSelected(isSelected ? null : player.id);
              }}
              disabled={isMe || myVoted}
              className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl transition-all duration-200 active:scale-95 relative overflow-hidden"
              style={{ background: bgColor, border: `1px solid ${borderColor}` }}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: isMe ? "#1C1C1C" : color + "20",
                  border: `1.5px solid ${isMe ? "#2A2A2A" : color + "50"}`,
                }}
              >
                <span
                  className="font-syne font-bold text-xl"
                  style={{ color: isMe ? "#333" : color }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name */}
              <p className="font-bold text-xs uppercase tracking-wider" style={{ color: nameColor }}>
                {player.name.length > 8 ? player.name.slice(0, 8) : player.name}
              </p>

              {/* Voted badge */}
              {hasVoted && (
                <div
                  className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: color + "30", border: `1px solid ${color}50` }}
                >
                  <span className="material-symbols-outlined text-[9px]" style={{ color, fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                </div>
              )}

              {isMe && (
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#333]">You</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Vote count */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {players.map((p) => (
            <div
              key={p.id}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: votedPlayerIds.has(p.id) ? "#E8FF47" : "#2A2A2A" }}
            />
          ))}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
          {votes.length} / {players.length} voted
        </p>
      </div>

      {/* Lock In */}
      {!myVoted ? (
        <button
          onClick={handleLockIn}
          disabled={!selected}
          className="w-full font-syne font-bold py-4 rounded-xl text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "#E8FF47", color: "#2D3400" }}
        >
          Lock In
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </button>
      ) : (
        <div
          className="w-full py-4 rounded-xl text-center text-sm font-bold uppercase tracking-widest"
          style={{ background: "#161616", border: "1px solid #2A2A2A", color: "#555" }}
        >
          Vote locked in ✓
        </div>
      )}
    </div>
  );
}
