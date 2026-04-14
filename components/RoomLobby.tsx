"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Player, Room } from "@/lib/types";
import BottomNav from "./BottomNav";

interface Props {
  room: Room;
  players: Player[];
  myPlayerName: string;
  isHost: boolean;
  onStartGame: () => void;
  starting: boolean;
}

const AVATAR_COLORS = ["#C97B84", "#6B8CAE", "#7AAE8C", "#C4A882"];

function avatarColor(name: string): string {
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function RoomLobby({ room, players, myPlayerName, isHost, onStartGame, starting }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(room.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#111111] flex justify-between items-center px-6 h-16">
        <span className="font-syne text-lg font-bold tracking-tighter text-[#F0F0F0] uppercase">TuneClash</span>
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border"
          style={{ color: "#888888", borderColor: "#2A2A2A" }}
        >
          Lobby
        </span>
      </header>

      <main className="flex-1 pt-20 pb-32 px-6 flex justify-center">
        <div className="w-full max-w-[480px] space-y-10 pt-4">

          {/* Room Code — hero treatment */}
          <section className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#555] mb-4">
              Room Code — share with friends
            </p>
            <div className="flex items-center justify-center gap-4">
              <h2
                className="font-mono font-bold tracking-[0.35em] text-[#E8FF47]"
                style={{ fontSize: "clamp(3rem, 14vw, 5rem)", lineHeight: 1 }}
              >
                {room.code}
              </h2>
              <button
                onClick={copyCode}
                className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all active:scale-90"
                style={{ color: copied ? "#E8FF47" : "#444" }}
                title="Copy code"
              >
                <span className="material-symbols-outlined text-xl">
                  {copied ? "check" : "content_copy"}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider">
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ color: "#888", backgroundColor: "#1C1B1B", border: "1px solid #2A2A2A" }}
              >
                {room.category}
              </div>
              <div
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ color: "#888", backgroundColor: "#1C1B1B", border: "1px solid #2A2A2A" }}
              >
                {players.length} {players.length === 1 ? "player" : "players"}
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-[#1F1F1F]" />

          {/* Players */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#555]">In the room</h3>
            <div className="flex gap-4 overflow-x-auto pb-1">
              {players.map((player) => {
                const isThisHost = player.name === room.host_name;
                const isMe       = player.name === myPlayerName;
                const color      = avatarColor(player.name);

                return (
                  <div key={player.id} className="flex flex-col items-center gap-2 shrink-0">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center relative"
                      style={{
                        background: color + "18",
                        border: `2px solid ${isThisHost ? color : color + "40"}`,
                      }}
                    >
                      <span className="font-syne font-bold text-xl" style={{ color }}>
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                      {isThisHost && (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: color, border: "2px solid #111111" }}
                        >
                          <span className="material-symbols-outlined text-[10px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                        </div>
                      )}
                      {isMe && !isThisHost && (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "#E8FF47", border: "2px solid #111111" }}
                        >
                          <span className="material-symbols-outlined text-[10px] text-[#2D3400]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                      {player.name.length > 7 ? player.name.slice(0, 7) : player.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-[#1F1F1F]" />

          {/* Add pick */}
          <section>
            <div
              className="rounded-2xl p-5 flex items-center justify-between"
              style={{ background: "#161616", border: "1px solid #2A2A2A" }}
            >
              <div>
                <p className="font-bold text-sm text-[#F0F0F0]">Submit your pick</p>
                <p className="text-[11px] text-[#555] mt-0.5">
                  Your favourite {room.category === "music" ? "track" : room.category === "movies" ? "film" : room.category === "games" ? "game" : "book"}
                </p>
              </div>
              <button
                onClick={() => router.push(`/room/${room.code}/add`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                style={{ background: "#E8FF47", color: "#2D3400" }}
              >
                Add Pick
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
          </section>

          {/* Start game */}
          <section>
            {isHost ? (
              <button
                onClick={onStartGame}
                disabled={starting || players.length < 1}
                className="w-full h-16 rounded-2xl font-syne font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#E8FF47", color: "#2D3400" }}
              >
                {starting ? <Spinner /> : (
                  <>
                    Start Game
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-[10px] text-[#555] uppercase tracking-[0.2em]">
                  Waiting for <span className="text-[#888]">{room.host_name}</span> to start
                </p>
                <div className="flex justify-center gap-1 pt-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#2A2A2A]"
                      style={{ animation: `pulse-dot 1.2s ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

        </div>
      </main>

      <BottomNav active="lobby" />
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
