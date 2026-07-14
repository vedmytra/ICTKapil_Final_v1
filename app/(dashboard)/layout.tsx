import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-ember-radial">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden p-5 lg:p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
