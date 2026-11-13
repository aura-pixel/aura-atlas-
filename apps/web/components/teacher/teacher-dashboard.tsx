"use client";
import { getSubjectTextColor } from "@/lib/subject-colors";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  GraduationCap,
  LoaderCircle,
  LogOut,
  Plus,
} from "lucide-react";
import { post } from "@/lib/api";
import { assetUrl } from "@/lib/config";
import { Butterfly } from "@/components/landing/learning-garden";
import { BetaBanner } from "./BetaBanner";
import styles from "./teacher-dashboard.module.css";

type AcademicContext = { name: string };
type Subject = {
  id: string;
  name: string;
  abbreviation?: string | null;
  description?: string | null;
  color?: string | null;
  logoUrl?: string | null;
};
type TeacherDashboardProps = {
  userName?: string;
  university?: AcademicContext;
  faculty?: AcademicContext;
  career?: AcademicContext;
  subjects?: Subject[];
  onCreateSubject?: () => void;
};

function StudyBooks() {
  return (
    <div className={styles.studyArt} aria-hidden="true">
      <svg
        viewBox="0 0 520 340"
        fill="none"
        className={styles.booksIllustration}
      >
        <path
          d="M107 75C174 16 270 52 302 33C394-18 476 88 446 177C490 260 401 304 323 279C239 319 138 283 113 244C29 223 39 118 107 75Z"
          fill="#e8afc0"
          fillOpacity=".35"
        />
        <path
          d="M117 245C185 209 380 209 424 248C472 290 145 314 98 280C77 265 94 255 117 245Z"
          fill="#8b9aaa"
          fillOpacity=".24"
        />
        <path
          d="M77 167C133 25 372 33 430 167C465 263 230 250 183 163"
          stroke="#4a1115"
          strokeOpacity=".22"
          strokeDasharray="4 7"
        />
        <g className={styles.loosePage}>
          <path
            d="M326 60L398 79L419 166L332 178L305 78Z"
            fill="#fffdf8"
            stroke="#4a1115"
            strokeWidth="1.4"
          />
          <path
            d="M326 60L331 89L305 78M345 102L388 111M346 117L395 127M350 133L381 140"
            stroke="#8b9aaa"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="361" cy="157" r="8" fill="#e8afc0" />
          <path
            d="M358 157L360 160L365 155"
            stroke="#4a1115"
            strokeWidth="1.4"
          />
        </g>
        <g className={styles.bookStack}>
          <path
            d="M130 236L326 212L402 236L204 266Z"
            fill="#8b9aaa"
            stroke="#4a1115"
            strokeWidth="1.5"
          />
          <path
            d="M130 236V256L204 285L402 254V236L204 266Z"
            fill="#fffdf8"
            stroke="#4a1115"
            strokeWidth="1.5"
          />
          <path
            d="M204 266V285M141 250L201 273M217 275L390 248"
            stroke="#8b9aaa"
            strokeWidth="1.5"
          />
          <path
            d="M112 211L308 189L387 210L187 240Z"
            fill="#e8afc0"
            stroke="#4a1115"
            strokeWidth="1.5"
          />
          <path
            d="M112 211V231L187 260L387 230V210L187 240Z"
            fill="#fffdf8"
            stroke="#4a1115"
            strokeWidth="1.5"
          />
          <path
            d="M187 240V260M124 226L184 249M199 249L376 222"
            stroke="#b996a1"
            strokeWidth="1.5"
          />
          <path
            d="M143 195L289 175L366 195L218 220Z"
            fill="#4a1115"
            stroke="#4a1115"
            strokeWidth="2"
          />
          <path
            d="M143 195V208L218 236L366 211V195L218 220Z"
            fill="#fffdf8"
            stroke="#4a1115"
            strokeWidth="1.5"
          />
          <path
            d="M218 220V236M158 204L214 225M230 227L355 205"
            stroke="#8b9aaa"
            strokeWidth="1.2"
          />
          <path
            d="M268 221V247L278 237L288 241V218"
            fill="#e8afc0"
            stroke="#4a1115"
            strokeWidth="1.2"
          />
        </g>
        <g className={styles.openBook}>
          <path
            d="M151 127C184 116 213 124 247 146C279 124 310 118 344 123L351 186C313 182 280 195 249 215C212 194 183 187 146 190Z"
            fill="#fffdf8"
            stroke="#4a1115"
            strokeWidth="1.8"
          />
          <path
            d="M247 146L249 215M155 199C191 197 218 206 249 224C281 204 317 194 351 195"
            stroke="#4a1115"
            strokeWidth="1.8"
          />
          <path
            d="M166 141C191 138 214 147 230 157M165 153C189 150 211 160 230 168M164 165C186 163 205 169 220 177M263 157C284 141 310 135 331 137M264 169C288 153 309 147 332 150M265 180C281 170 297 165 310 163"
            stroke="#8b9aaa"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
        <g transform="translate(125 89) rotate(-12)">
          <rect
            width="45"
            height="47"
            rx="10"
            fill="#fffdf8"
            stroke="#4a1115"
            strokeOpacity=".25"
          />
          <path
            d="M14 14H31V34L22 29L14 34Z"
            fill="#e8afc0"
            stroke="#4a1115"
            strokeWidth="1.3"
          />
        </g>
      </svg>
      <Butterfly className={styles.butterflyOne} />
      <Butterfly className={styles.butterflyTwo} />
    </div>
  );
}

export function TeacherDashboard({
  userName = "Docente",
  university,
  faculty,
  career,
  subjects = [],
  onCreateSubject,
}: TeacherDashboardProps) {
  const router = useRouter();
  const client = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  function handleCreateSubject() {
    if (onCreateSubject) onCreateSubject();
    else router.push("/teacher/subjects/new");
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await post("/auth/logout", {});
      client.clear();
      localStorage.removeItem("auth");
      router.replace("/");
    } catch {
      setLogoutError("No pudimos cerrar la sesión. Inténtalo de nuevo.");
      setLoggingOut(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundShape} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            href="/teacher/dashboard"
            className={styles.brand}
            aria-label="Aura Atlas, mi espacio docente"
          >
            <Image
              src="/aura-atlas.png"
              width={36}
              height={36}
              alt=""
              priority
            />
            <span>
              Aura Atlas<small>ESPACIO DOCENTE</small>
            </span>
          </Link>
          <nav className={styles.nav} aria-label="Navegación del docente">
            <a href="#materias" aria-current="page">
              Mis materias
            </a>
            <Link href="/teacher/requests">Mis solicitudes</Link>
          </nav>
          <div className={styles.profile}>
            <span className={styles.profileName}>{userName}</span>
            <span className={styles.avatar} aria-hidden="true">
              {Array.from(userName.trim())[0]?.toLocaleUpperCase("es") || "D"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className={styles.logout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              {loggingOut ? (
                <LoaderCircle size={17} className={styles.spinner} />
              ) : (
                <LogOut size={17} />
              )}
            </button>
          </div>
        </div>
      </header>
      <div className={styles.content}>
        {logoutError && (
          <p role="alert" className={styles.error}>
            {logoutError}
          </p>
        )}
        <section className={styles.hero} aria-labelledby="dashboard-title">
          <div className={styles.heroCopy}>
            <h1 id="dashboard-title">
              Hola, <em>{userName}.</em>
            </h1>
            <p>
              Organiza tus materias y crea experiencias de aprendizaje a tu
              manera.
            </p>
            {subjects.length > 0 && (
              <button
                type="button"
                onClick={handleCreateSubject}
                className={styles.primaryButton}
              >
                <Plus size={17} /> Nueva materia <ArrowUpRight size={17} />
              </button>
            )}
          </div>
          <StudyBooks />
        </section>
        <section
          className={styles.academicContext}
          aria-labelledby="context-title"
        >
          <div className={styles.contextHeading}>
            <h2 id="context-title">
              <GraduationCap size={16} /> Tu espacio académico
            </h2>
            <Link href="/teacher">
              Configurar <ArrowUpRight size={13} />
            </Link>
          </div>
          <dl className={styles.contextGrid}>
            {[
              ["Universidad", university?.name || "Selecciona tu universidad"],
              ["Facultad", faculty?.name || "Selecciona tu facultad"],
              ["Carrera", career?.name || "Selecciona tu carrera"],
            ].map(([label, name]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{name}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section
          id="materias"
          className={styles.subjectSection}
          aria-labelledby="subjects-title"
        >
          <div className={styles.sectionHeading}>
            <h2 id="subjects-title">
              Tus <em>materias.</em>
            </h2>
            <span>
              {subjects.length}{" "}
              {subjects.length === 1
                ? "materia disponible"
                : "materias disponibles"}
            </span>
          </div>
          {subjects.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon} aria-hidden="true">
                <BookOpen size={42} strokeWidth={1.3} />
                <span className={styles.bookmark}>
                  <Bookmark size={17} />
                </span>
              </div>
              <div className={styles.emptyCopy}>
                <h3>Empieza con tu primera materia.</h3>
                <p>
                  Añade una materia para organizar sus unidades, temas y
                  recursos.
                </p>
                <button
                  type="button"
                  onClick={handleCreateSubject}
                  className={styles.primaryButton}
                >
                  Crear mi primera materia <ArrowRight size={17} />
                </button>
              </div>
              <Butterfly className={styles.emptyButterfly} />
            </div>
          ) : (
            <>
              <div className={styles.subjectGrid}>
                {subjects.map((subject) => {
                  const logo = subject.logoUrl
                    ? assetUrl(subject.logoUrl)
                    : null;
                  return (
                    <Link
                      key={subject.id}
                      href={`/teacher/subjects/${subject.id}`}
                      className={styles.subjectCard}
                      style={
                        {
                          "--subject-color": subject.color || "#4a1115",
                          "--subject-ink": getSubjectTextColor(
                            subject.color || "#4a1115",
                          ),
                        } as CSSProperties
                      }
                    >
                      <div className={styles.cover} aria-hidden="true">
                        <span className={styles.coverShape} />
                        <span className={styles.bookCover}>
                          {logo ? (
                            <Image
                              src={logo}
                              alt=""
                              width={60}
                              height={60}
                              unoptimized
                            />
                          ) : (
                            <BookOpen size={30} strokeWidth={1.4} />
                          )}
                          {subject.abbreviation && (
                            <span>{subject.abbreviation}</span>
                          )}
                        </span>
                      </div>
                      <div className={styles.subjectInfo}>
                        <h3>{subject.name}</h3>
                        {subject.description && <p>{subject.description}</p>}
                        <div className={styles.openSubject}>
                          <span>Abrir materia</span>
                          <ArrowUpRight size={17} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleCreateSubject}
                className={styles.addSubject}
              >
                <span>
                  <Plus size={24} strokeWidth={1.4} />
                </span>
                <strong>Nueva materia</strong>
              </button>
            </>
          )}
        </section>
        <BetaBanner />
        <footer className={styles.footer}>
          <span>Aura Atlas · by Tzalli Studio</span>
          <Link href="/">
            Volver al inicio <ArrowUpRight size={12} />
          </Link>
        </footer>
      </div>
    </main>
  );
}
