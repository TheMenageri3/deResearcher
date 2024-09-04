import Navbar from "@/components/Navbar/Navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="w-screen min-h-screen overflow-x-hidden">
      <Navbar />
      {children}
    </main>
  );
}
