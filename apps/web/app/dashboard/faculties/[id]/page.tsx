import { notFound } from "next/navigation";

import { get } from "@/lib/api";

import { FacultySettingsPage } from "@/components/dashboard/faculties/faculty-settings-page";

import type { Faculty } from "@/types/faculty";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FacultyPage({
  params,
}: Props) {
  const { id } = await params;

  let faculty: Faculty;

  try {
    faculty = await get<Faculty>(
      `/faculties/${id}`,
    );
  } catch {
    notFound();
  }

  return (
    <FacultySettingsPage
      faculty={faculty}
    />
  );
}