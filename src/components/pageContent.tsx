interface PageContentProps {
  children: React.ReactNode;
}

export default function PageContent({ children }: PageContentProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-4 sm:px-6 sm:py-6 lg:px-10">
      {children}
    </div>
  );
}
