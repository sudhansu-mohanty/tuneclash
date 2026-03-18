import type { Entry } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  music: "bg-accent",
  movies: "bg-accent-blue",
  games: "bg-accent-green",
  books: "bg-accent-yellow text-zinc-900",
};

interface Props {
  entry: Entry;
}

export default function RevealCard({ entry }: Props) {
  const badgeClass =
    CATEGORY_COLORS[entry.category.toLowerCase()] ?? "bg-zinc-600";

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 flex flex-col items-center gap-4 text-center w-full max-w-md mx-auto">
      <span
        className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${badgeClass}`}
      >
        {entry.category}
      </span>
      <h2 className="font-syne text-3xl font-extrabold text-white leading-tight">
        {entry.title}
      </h2>
      {entry.creator && (
        <p className="text-zinc-400 text-lg">{entry.creator}</p>
      )}
    </div>
  );
}
