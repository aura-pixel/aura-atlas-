import { get } from "@/lib/api";

import { UniversitySettingsPage } from "@/components/dashboard/universities/university-settings-page";

import type { University } from "@/types/university";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({
  params,
}: PageProps) {
  const { id } = await params;

  const university = await get<University>(
    `/universities/${id}`
  );

  return (
    <UniversitySettingsPage
      university={university}
    />
  );
}