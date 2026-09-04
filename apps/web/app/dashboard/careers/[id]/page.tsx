import { notFound } from "next/navigation";

import { get } from "@/lib/api";

import { CareerPage } from "@/components/dashboard/careers/career-page";

import type { Career } from "@/types/career";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { id } = await params;

  try {
    const career = await get<Career>(
      `/careers/${id}`,
    );

    return (
      <CareerPage
        career={career}
      />
    );
  } catch {
    notFound();
  }
}