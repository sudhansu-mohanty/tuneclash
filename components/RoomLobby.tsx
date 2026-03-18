"use client";

import Link from "next/link";
import type { Player, Room } from "@/lib/types";

interface Props {
  room: Room;
  players: Player[];
  myPlayerName: string;
  isHost: boolean;
  onStartGame: () => void;
  starting: boolean;
}

export default function RoomLobby({
  room,
  players,
  myPlayerName,
  isHost,
  onStartGame,
  starting,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto px-4 py-12">
      {/* Room code */}
      <div className="text-center">
        <p className="text-zinc-500 text-sm uppercase tracking-widest mb-2">
          Room code
        </p>
        <h1 className="font-syne text-6xl font-extrabold tracking-widest text-white">
          {room.code}
        </h1>
        <p className="text-zinc-500 text-sm mt-2">
          Share this code with friends
        </p>
      </div>

      {/* Players */}
      <div className="w-full bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-400 text-sm">Players</span>
          <span className="text-zinc-500 text-sm">{players.length} joined</span>
        </div>
        <div className="flex flex-col divide-y divide-zinc-800">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={player.name} />
              <span className="text-white font-medium">{player.name}</span>
              {player.name === room.host_name && (
                <span className="ml-auto text-xs text-accent font-bold uppercase tracking-wide">
                  host
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3">
        <Link
          href={`/room/${room.code}/add`}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-center transition-colors"
        >
          + Add my pick
        </Link>

        {isHost && (
          <button
            onClick={onStartGame}
            disabled={starting || players.length < 1}
            className="w-full bg-accent hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-syne font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {starting ? <Spinner /> : "Start game →"}
          </button>
        )}

        {!isHost && (
          <p className="text-zinc-500 text-sm text-center">
            Waiting for {room.host_name} to start the game…
          </p>
        )}
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
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

  return (
    <span
      className={`${color} w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0`}
    >
      {initial}
    </span>
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
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
