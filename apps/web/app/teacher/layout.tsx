import { requireSession } from "@/lib/server-auth";
import { VerificationNotice } from "@/components/auth/verification-notice";
import { UniversityStatusNotice } from "@/components/auth/university-status-notice";
export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();
  return (
    <>
      <VerificationNotice user={user} />
      <UniversityStatusNotice />
      {children}
    </>
  );
}
