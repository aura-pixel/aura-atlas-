"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";

export function UniversityStatusNotice() {
  const { data = [] } = useQuery({
    queryKey: ["university-requests"],
    queryFn: () => get<{ status: string }[]>("/university-requests"),
    staleTime: 0,
  });
  if (!data.some((row) => row.status !== "APPROVED")) return null;
  return (
    <aside className="relative z-20 flex flex-wrap items-center justify-center gap-3 border-b border-[#4a1115]/10 bg-[#edf0f2] px-5 py-3 text-center text-xs leading-5 text-[#4a1115]">
      Tu espacio provisional sigue siendo privado mientras se revisan sus datos.{" "}
      <Link
        href="/teacher/requests"
        className="font-semibold underline underline-offset-4"
      >
        Ver mis solicitudes
      </Link>
    </aside>
  );
}
