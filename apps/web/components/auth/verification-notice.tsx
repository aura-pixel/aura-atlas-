import Link from "next/link";

export function VerificationNotice({
  user,
}: {
  user: {
    role?: string;
    emailVerified?: boolean;
    emailVerificationDeadline?: string;
  };
}) {
  if (
    user.role === "SUPER_ADMIN" ||
    user.emailVerified !== false ||
    !user.emailVerificationDeadline
  )
    return null;
  const deadline = new Date(user.emailVerificationDeadline);
  const days = Math.max(
    1,
    Math.ceil((deadline.getTime() - Date.now()) / 86400000),
  );
  return (
    <aside
      role="status"
      className="relative z-30 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-[#4a1115]/10 bg-[#f5e2e5] px-5 py-3 text-center text-xs leading-5 text-[#4a1115]"
    >
      <span>
        Tu espacio ya está activo. Verifica tu correo antes del{" "}
        {deadline.toLocaleString("es-MX", {
          timeZone: "America/Mexico_City",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        ({days} {days === 1 ? "día restante" : "días restantes"}).
      </span>
      <Link
        href="/verify-email"
        className="font-semibold underline underline-offset-4"
      >
        Verificar correo
      </Link>
    </aside>
  );
}
