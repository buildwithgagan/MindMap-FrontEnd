import BottomNavbar from "@/components/shared/BottomNavbar";
import Sidebar from "@/components/shared/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen relative overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 md:pl-64 md:pb-0 pb-16 relative z-10 w-full min-w-0">
        <div className="container mx-auto h-full max-w-3xl px-4 py-8 md:py-12 w-full">
            {children}
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
}
