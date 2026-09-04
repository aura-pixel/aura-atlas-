"use client";

import { useEffect, useState } from "react";

import { get } from "@/lib/api";

import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";

type UserCareer = {
  career: {
    id: string;
    name: string;
    abbreviation?: string;
    description?: string;
    logoUrl?: string;
    color?: string;
    faculty: {
      id: string;
      name: string;
      abbreviation?: string;
      description?: string;
      logoUrl?: string;
      color?: string;
      university: {
        id: string;
        name: string;
        abbreviation: string;
        description?: string;
        logoUrl?: string;
      };
    };
  };
};

type User = {
  id: string;
  name: string;
  email: string;
  careers: UserCareer[];
  hypertexts: unknown[];
};

type Subject = {
  id: string;
  name: string;
  abbreviation?: string;
  description?: string;
  logoUrl?: string;
  color?: string;
};

export default function TeacherDashboardPage() {
  const [user, setUser] = useState<User | null>(
    null,
  );

  const [subjects, setSubjects] = useState<
    Subject[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Obtener usuario y contexto académico
        const data = await get<User>(
          "/users/me",
        );

        setUser(data);

        const career =
          data.careers?.[0]?.career;

        // Si todavía no tiene carrera,
        // no buscamos materias.
        if (!career) {
          return;
        }

        // Obtener materias de esa carrera
        const careerSubjects =
          await get<Subject[]>(
            `/subjects/career/${career.id}`,
          );

        setSubjects(careerSubjects);
      } catch (error) {
        console.error(
          "Error al cargar el dashboard:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Cargando tu espacio...
        </p>
      </main>
    );
  }

  const userCareer = user?.careers?.[0];

  const career = userCareer?.career;
  const faculty = career?.faculty;
  const university =
    faculty?.university;

  return (
    <TeacherDashboard
      userName={user?.name}
      university={
        university
          ? {
              name: university.name,
            }
          : undefined
      }
      faculty={
        faculty
          ? {
              name: faculty.name,
            }
          : undefined
      }
      career={
        career
          ? {
              name: career.name,
            }
          : undefined
      }
      subjects={subjects}
    />
  );
}