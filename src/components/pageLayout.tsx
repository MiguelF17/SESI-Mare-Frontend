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
      <div className="fixed left-0 right-0 top-0 z-40 hidden h-16 md:block md:left-[clamp(220px,30vw,340px)]">
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center px-6 lg:px-10">
          <DesktopSearchBar />
        </div>
      </div>

      <main className="ml-0 min-h-screen min-w-0 pb-[calc(72px+env(safe-area-inset-bottom))] md:ml-[clamp(220px,30vw,340px)] md:pb-0 md:pt-16">
        {children}
      </main>
    </div>
  );
}
