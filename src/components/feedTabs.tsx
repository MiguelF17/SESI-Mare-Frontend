interface FeedTabsProps {
  abaAtiva: "paraVoce" | "seguindo";
  setAbaAtiva: (aba: "paraVoce" | "seguindo") => void;
}

export default function FeedTabs({
  abaAtiva,
  setAbaAtiva,
}: FeedTabsProps) {
  return (
    <div className="flex items-center justify-center gap-8 px-2 sm:mb-3 sm:mt-3 sm:gap-10 md:mb-1 md:mt-0">
      <button
        onClick={() => setAbaAtiva("paraVoce")}
        className={`cursor-pointer pb-1 text-xs sm:pb-2 sm:text-lg ${
          abaAtiva === "paraVoce"
            ? "border-b-2 border-[var(--cor-destaque-alternativo)] text-[var(--cor-texto-principal)]"
            : "text-[var(--cor-texto-discreto)]"
        }`}
      >
        Para você
      </button>

      <button
        onClick={() => setAbaAtiva("seguindo")}
        className={`cursor-pointer pb-1 text-xs sm:pb-2 sm:text-lg ${
          abaAtiva === "seguindo"
            ? "border-b-2 border-[var(--cor-destaque-alternativo)] text-[var(--cor-texto-principal)]"
            : "text-[var(--cor-texto-discreto)]"
        }`}
      >
        Seguindo
      </button>
    </div>
  );
}
