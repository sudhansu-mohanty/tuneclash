import type { Player } from "@/lib/types";

interface Props {
  players: Player[];
}

export default function Leaderboard({ players }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3">
      <h3 className="font-syne font-bold text-white">Leaderboard</h3>
      <div className="flex flex-col gap-2">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className="flex items-center gap-3 bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-800"
          >
            <span
              className={`font-syne font-bold text-lg w-6 ${
                i === 0
                  ? "text-accent-yellow"
                  : i === 1
                  ? "text-zinc-300"
                  : i === 2
                  ? "text-orange-600"
                  : "text-zinc-500"
              }`}
            >
              {i + 1}
            </span>
            <Avatar name={player.name} />
            <span className="flex-1 text-white font-medium">{player.name}</span>
            <span className="bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full">
              {player.score} pts
            </span>
          </div>
        ))}
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
      className={`${color} w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0`}
    >
      {initial}
    </span>
  );
}
