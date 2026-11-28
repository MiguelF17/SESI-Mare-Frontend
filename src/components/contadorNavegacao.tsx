export interface ContadoresNavegacao {
  notificacoes: number;
  mensagens: number;
}

export default function ContadorNavegacao({ quantidade }: { quantidade: number }) {
  if (quantidade <= 0) return null;

  return (
    <span aria-hidden="true" className="absolute right-0 top-0 flex h-4 min-w-4 -translate-y-1/4 translate-x-1/2 items-center justify-center rounded-full bg-[var(--cor-destaque-forte)] px-1 text-[10px] font-semibold text-white">
      {quantidade > 99 ? "99+" : quantidade}
    </span>
  );
}
