import Navigation from "@/components/Navigation";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navigation />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pt-24 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-12">
          {children}
        </main>
      </div>
    </>
  );
}
