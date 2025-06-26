import Navigation from "@/components/Navigation";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (<>
    <Navigation />
    <div className="mt-[100px] lg:mt-0 lg:ml-[320px] p-4">
      {children}
    </div>
  </>
  );
}