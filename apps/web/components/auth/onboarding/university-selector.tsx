"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { get } from "@/lib/api";

import { OnboardingHeader } from "./onboarding-header";
import { UniversityList } from "./university-list";
import { FacultyList } from "./faculty-list";
import { CareerList } from "./career-list";

import type { University } from "@/types/university";
import type { Faculty } from "@/types/faculty";
import type { Career } from "@/types/career";

export function UniversitySelector() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [universities, setUniversities] =
    useState<University[]>([]);

  const [faculties, setFaculties] =
    useState<Faculty[]>([]);

  const [careers, setCareers] =
    useState<Career[]>([]);

  const [
    selectedUniversity,
    setSelectedUniversity,
  ] =
    useState<University | null>(
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

  useEffect(() => {
    async function loadUniversities() {
      try {
        const data =
  await get<University[]>("/universities");

        setUniversities(data);
      } finally {
        setLoading(false);
      }
    }

    loadUniversities();
  }, []);

  useEffect(() => {
  if (!selectedUniversity) return;

  const universityId = selectedUniversity.id;

  async function loadFaculties() {
    const data = await get<Faculty[]>(
      `/faculties?universityId=${universityId}`,
    );

    setFaculties(data);
    setSelectedFaculty(null);
    setSelectedCareer(null);
    setCareers([]);
  }

  loadFaculties();
}, [selectedUniversity]);

  useEffect(() => {
  if (!selectedFaculty) return;

  const facultyId = selectedFaculty.id;

  async function loadCareers() {
    const data = await get<Career[]>(
      `/careers?facultyId=${facultyId}`,
    );

    setCareers(data);
    setSelectedCareer(null);
  }

  loadCareers();
}, [selectedFaculty]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-3xl space-y-8">

        <OnboardingHeader
          title="¿A qué universidad perteneces?"
          description="Selecciona tu universidad, facultad y carrera."
        />

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Buscar universidad..."
            className="pl-12"
          />
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">
            Cargando universidades...
          </p>
        ) : (
          <UniversityList
            universities={universities}
            selectedUniversity={
              selectedUniversity
            }
            onSelect={
              setSelectedUniversity
            }
          />
        )}

        {selectedUniversity && (
          <FacultyList
            faculties={faculties}
            selectedFaculty={
              selectedFaculty
            }
            onSelect={
              setSelectedFaculty
            }
          />
        )}

        {selectedFaculty && (
          <CareerList
            careers={careers}
            selectedCareer={
              selectedCareer
            }
            onSelect={
              setSelectedCareer
            }
          />
        )}

        {selectedCareer && (
          <Button
            className="w-full"
            onClick={() =>
              router.push(
                "/auth/teacher-type",
              )
            }
          >
            Continuar
          </Button>
        )}

        <div className="flex justify-center">
          <Button
            variant="link"
            onClick={() =>
              router.push(
                "/auth/request",
              )
            }
          >
            No encontré mi universidad
          </Button>
        </div>

      </div>
    </main>
  );
}
