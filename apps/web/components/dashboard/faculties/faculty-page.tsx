import { FacultySettingsPage } from "./faculty-settings-page";

import type { Career } from "@/types/career";
import type { Faculty } from "@/types/faculty";

type Props = {
  faculty: Faculty & {
    careers?: Career[];
  };
};

export function FacultyPage({
  faculty,
}: Props) {
  return (
    <FacultySettingsPage
      faculty={faculty}
    />
  );
}