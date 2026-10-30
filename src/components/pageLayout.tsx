import Sidebar from "./sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--cor-fundo)] text-[var(--cor-texto-principal)]">
      <Sidebar />

      <main className="ml-16 min-h-screen min-w-0 md:ml-[clamp(220px,30vw,340px)]">
        {children}
      </main>
    </div>
  );
}
