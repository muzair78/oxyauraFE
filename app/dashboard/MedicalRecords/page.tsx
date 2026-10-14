import AuthGuard from "@/components/authentication/AuthGuard";
import MedicalRecords from "@/components/dashboard/MedicalRecords";

export default function MedicalRecordsPage() {
  return (
    <AuthGuard>
      <MedicalRecords />
    </AuthGuard>
  );
}
