import type { Player } from "@/lib/types";

interface Props {
  players: Player[];
}

const AVATAR_COLORS = ["#C97B84", "#6B8CAE", "#7AAE8C", "#C4A882"];

function avatarColor(name: string): string {
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function Leaderboard({ players }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#555]">Standings</h2>
      <div className="space-y-2">
        {sorted.map((player, i) => {
          const isFirst = i === 0;
          const color   = avatarColor(player.name);

          return (
            <div
              key={player.id}
              className="flex items-center gap-4 p-4 rounded-xl transition-colors"
              style={
                isFirst
                  ? { background: "#1C1B1B", borderLeft: "3px solid #E8FF47", paddingLeft: "14px" }
                  : { background: "#161616", border: "1px solid #1F1F1F" }
              }
            >
              {/* Rank */}
              <span
                className="font-syne text-sm font-bold w-6 text-right shrink-0"
                style={{ color: isFirst ? "#E8FF47" : "#333" }}
              >
                {i + 1}
              </span>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: color + "20", border: `1px solid ${color}40` }}
              >
                <span className="font-syne font-bold text-sm" style={{ color }}>
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#F0F0F0] truncate">{player.name}</p>
                {isFirst && (
                  <p className="text-[9px] uppercase tracking-widest font-bold mt-0.5" style={{ color: "rgba(232,255,71,0.5)" }}>
                    Leading
                  </p>
                )}
              </div>

              {/* Score */}
              <span className="font-syne font-bold text-base shrink-0" style={{ color: isFirst ? "#E8FF47" : "#F0F0F0" }}>
                {player.score.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
