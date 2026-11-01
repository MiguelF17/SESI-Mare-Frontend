import Sidebar from "./sidebar";
import MobileNavigation from "./mobileNavigation";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--cor-fundo)] text-[var(--cor-texto-principal)]">
      <Sidebar />
      <MobileNavigation />

      <main className="ml-0 min-h-screen min-w-0 pb-[calc(72px+env(safe-area-inset-bottom))] md:ml-[clamp(220px,30vw,340px)] md:pb-0">
        {children}
      </main>
    </div>
  );
}
