import { UniversityPage } from "@/components/dashboard/universities/university-page";

import { get } from "@/lib/api";

import type { University } from "@/types/university";

export default async function Page() {
  const universities =
    await get<University[]>("/universities");

  return (
    <UniversityPage
      universities={universities}
    />
  );
}