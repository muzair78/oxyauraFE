import AuthGuard from "@/components/authentication/AuthGuard";
import AskAuraAI from "@/components/dashboard/AskAuraAI";

export default function AskAuraAIPage() {
  return (
    <AuthGuard>
      <AskAuraAI />
    </AuthGuard>
  );
}
