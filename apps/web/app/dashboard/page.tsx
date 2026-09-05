import { get } from "@/lib/api";

import { UniversityPage } from "@/components/dashboard/universities/university-page";

import type { University } from "@/types/university";

export const dynamic = "force-dynamic";

export default async function Page() {

  const universities =
    await get<University[]>("/universities");

  return (
    <UniversityPage
      universities={universities}
    />
  );

}
