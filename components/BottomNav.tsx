type Tab = "lobby" | "games" | "social" | "profile";

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "lobby",   label: "LOBBY",   icon: "grid_view" },
  { id: "games",   label: "GAMES",   icon: "style" },
  { id: "social",  label: "SOCIAL",  icon: "group" },
  { id: "profile", label: "PROFILE", icon: "person" },
];

export default function BottomNav({ active = "games" }: { active?: Tab }) {
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#111111]/80 backdrop-blur-xl border-t border-[#464834]/15 flex justify-around items-center h-20 px-4">
      {ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <div
            key={item.id}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90 select-none ${
              isActive ? "text-[#E8FF47]" : "text-[#888888]"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em" }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
