import Sidebar from "./sidebar";
import MobileNavigation from "./mobileNavigation";
import { DesktopSearchBar } from "./searchbar";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--cor-fundo)] text-[var(--cor-texto-principal)]">
      <Sidebar />
      <MobileNavigation />
      <div className="fixed left-1/2 top-4 z-40 hidden -translate-x-1/2 md:block desktop-search-width">
        <DesktopSearchBar />
      </div>

      <main className="ml-0 min-h-screen min-w-0 pb-[calc(72px+env(safe-area-inset-bottom))] md:ml-[clamp(220px,30vw,340px)] md:pb-0 md:pt-20">
        {children}
      </main>
    </div>
  );
}
