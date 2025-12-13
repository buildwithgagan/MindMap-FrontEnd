import BottomNavbar from "@/components/shared/BottomNavbar";
import Sidebar from "@/components/shared/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:pl-64 md:pb-0 pb-16">
        <div className="container mx-auto h-full max-w-3xl px-4 py-8 md:py-12">
            {children}
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
}
