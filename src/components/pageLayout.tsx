import Sidebar from "./sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#080A10] text-white">
      <Sidebar />

      <main className="ml-0 md:ml-[340px] min-h-screen">
        {children}
      </main>
    </div>
  );
}