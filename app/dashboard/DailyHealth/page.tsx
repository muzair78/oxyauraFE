import AuthGuard from "@/components/authentication/AuthGuard";
import DailyHealth from "@/components/dashboard/DailyHealth";

export default function DailyHealthPage() {
  return (
    <AuthGuard>
      <DailyHealth />
    </AuthGuard>
  );
}
