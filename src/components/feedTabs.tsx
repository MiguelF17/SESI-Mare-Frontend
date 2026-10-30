interface FeedTabsProps {
  abaAtiva: "paraVoce" | "seguindo";
  setAbaAtiva: (aba: "paraVoce" | "seguindo") => void;
}

export default function FeedTabs({
  abaAtiva,
  setAbaAtiva,
}: FeedTabsProps) {
  return (
    <div className="mb-5 flex items-center justify-center gap-10 px-2 mt-5">
      <button
        onClick={() => setAbaAtiva("paraVoce")}
        className={`pb-2 text-lg cursor-pointer ${
          abaAtiva === "paraVoce"
            ? "border-b-2 border-[var(--cor-destaque-alternativo)] text-[var(--cor-texto-principal)]"
            : "text-[var(--cor-texto-discreto)]"
        }`}
      >
        Para você
      </button>

      <button
        onClick={() => setAbaAtiva("seguindo")}
        className={`pb-2 text-lg cursor-pointer ${
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