import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/Dashboard/Navbar";
import Sidebar from "@/components/Dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // here we use ProtectedRoute to protect the dashboard layout
    <ProtectedRoute>
      <div className="flex h-screen bg-zinc-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <DashboardNavbar />
          <div className="flex-1 overflow-x-hidden bg-zinc-100">
            <div className="container mx-auto px-6 py-8">{children}</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
