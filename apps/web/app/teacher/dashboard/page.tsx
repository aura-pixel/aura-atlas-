"use client";

import { useEffect, useState } from "react";

import { get } from "@/lib/api";

import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";
import { BookOpen } from "lucide-react";
import styles from "@/components/teacher/teacher-dashboard.module.css";

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
  const [user, setUser] = useState<User | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Obtener usuario y contexto académico
        const data = await get<User>("/users/me");

        setUser(data);

        const career = data.careers?.[0]?.career;

        // Si todavía no tiene carrera,
        // no buscamos materias.
        if (!career) {
          return;
        }

        // Obtener materias de esa carrera
        const careerSubjects = await get<Subject[]>(
          `/subjects/career/${career.id}`,
        );

        setSubjects(careerSubjects);
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className={styles.statePage} role="status">
        <BookOpen size={35} strokeWidth={1.4} aria-hidden="true" />
        <p>Cargando tu espacio...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.statePage}>
        <p role="alert">No pudimos cargar tu espacio. Inténtalo de nuevo.</p>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </main>
    );
  }

  const userCareer = user?.careers?.[0];

  const career = userCareer?.career;
  const faculty = career?.faculty;
  const university = faculty?.university;

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
