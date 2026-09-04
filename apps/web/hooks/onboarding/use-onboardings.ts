"use client";

import { useEffect, useState } from "react";

import { useUniversities } from "../queries/use-universities";
import { useFaculties } from "../queries/use-faculties";
import { useCareers } from "../queries/use-careers";

import type { University } from "@/types/university";
import type { Faculty } from "@/types/faculty";
import type { Career } from "@/types/career";

export function useOnboarding() {
  const [
    selectedUniversity,
    setSelectedUniversity,
  ] = useState<University | null>(
    null,
  );

  const [
    selectedFaculty,
    setSelectedFaculty,
  ] = useState<Faculty | null>(
    null,
  );

  const [
    selectedCareer,
    setSelectedCareer,
  ] = useState<Career | null>(
    null,
  );

  const {
    data: universities = [],
    isLoading: universitiesLoading,
  } = useUniversities();

  const {
    data: faculties = [],
  } = useFaculties(
    selectedUniversity?.id,
  );

  const {
    data: careers = [],
  } = useCareers(
    selectedFaculty?.id,
  );

  useEffect(() => {
    setSelectedFaculty(null);
    setSelectedCareer(null);
  }, [selectedUniversity]);

  useEffect(() => {
    setSelectedCareer(null);
  }, [selectedFaculty]);

  return {
    loading: universitiesLoading,

    universities,
    faculties,
    careers,

    selectedUniversity,
    selectedFaculty,
    selectedCareer,

    setSelectedUniversity,
    setSelectedFaculty,
    setSelectedCareer,
  };
}