import Navigation from "@/components/Navigation";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-amber font-semibold text-night focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-3"
      >
        Skip to content
      </a>
      <Navigation />
      <div className="lg:pl-64">
        <main
          id="main"
          className="mx-auto w-full max-w-6xl px-4 pt-24 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-12"
        >
          {children}
        </main>
      </div>
    </>
  );
}
