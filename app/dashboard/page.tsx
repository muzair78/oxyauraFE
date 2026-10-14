import AuthGuard from "@/components/authentication/AuthGuard";
import Dashboard from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
