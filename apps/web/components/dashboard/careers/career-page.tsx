import { CareerSettingsPage } from "./career-settings-page";

import type { Career } from "@/types/career";
import type { Subject } from "@/types/subject";

type Props = {
  career: Career & {
    subjects?: Subject[];
  };
};

export function CareerPage({
  career,
}: Props) {
  return (
    <CareerSettingsPage
      career={career}
    />
  );
}