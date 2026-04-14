import type { Entry } from "@/lib/types";

const CATEGORY_STYLES: Record<string, { color: string; icon: string }> = {
  music:  { color: "#C97B84", icon: "music_note" },
  movies: { color: "#6B8CAE", icon: "movie" },
  games:  { color: "#7AAE8C", icon: "sports_esports" },
  books:  { color: "#C4A882", icon: "menu_book" },
};

interface Props {
  entry: Entry;
}

export default function RevealCard({ entry }: Props) {
  const style = CATEGORY_STYLES[entry.category.toLowerCase()] ?? { color: "#888888", icon: "star" };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        background: "#1A1A1A",
        border: `1px solid ${style.color}35`,
        boxShadow: `0 0 48px ${style.color}12, 0 0 0 1px ${style.color}20`,
      }}
    >
      {/* Colored top strip */}
      <div style={{ height: "3px", background: `linear-gradient(to right, ${style.color}, ${style.color}50)` }} />

      <div className="flex flex-col items-center justify-center p-8 text-center gap-6">

        {/* Icon in circle */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: style.color + "20", border: `1px solid ${style.color}40` }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "26px", color: style.color, fontVariationSettings: "'FILL' 1" }}
          >
            {style.icon}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="font-syne text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-[#F0F0F0] leading-tight">
            {entry.title}
          </h2>
          {entry.creator && (
            <p className="text-[#555] text-sm">by {entry.creator}</p>
          )}
        </div>

        {/* Divider with label */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px" style={{ background: style.color + "25" }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: style.color + "80" }}>
            Whose fave?
          </span>
          <div className="flex-1 h-px" style={{ background: style.color + "25" }} />
        </div>

        {/* Category badge */}
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
          style={{
            color: style.color,
            background: style.color + "15",
            border: `1px solid ${style.color}35`,
          }}
        >
          {entry.category}
        </span>

      </div>
    </div>
  );
}
