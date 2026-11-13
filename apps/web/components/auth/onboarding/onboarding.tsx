"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  LoaderCircle,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useOnboarding } from "@/hooks/onboarding/use-onboardings";
import { patch } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { UniversityRequestModal } from "./university-request-modal";
import styles from "./onboarding.module.css";

const searchable = (value: string) =>
  value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
export function Onboarding() {
  const router = useRouter();
  const client = useQueryClient();
  const {
    loading,
    universities,
    faculties,
    careers,
    selectedUniversity,
    selectedFaculty,
    selectedCareer,
    setSelectedUniversity,
    setSelectedFaculty,
    setSelectedCareer,
  } = useOnboarding();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const step = !selectedUniversity ? 1 : !selectedFaculty ? 2 : 3;
  const filtered = useMemo(
    () =>
      universities.filter((item) =>
        searchable(`${item.name} ${item.abbreviation}`).includes(
          searchable(search.trim()),
        ),
      ),
    [universities, search],
  );
  function back() {
    if (step === 3) setSelectedFaculty(null);
    else if (step === 2) setSelectedUniversity(null);
    else router.push("/welcome");
  }
  async function finish() {
    if (!selectedCareer || busy) return;
    setBusy(true);
    setError("");
    try {
      await patch("/users/me/career", { careerId: selectedCareer.id });
      await client.invalidateQueries({ queryKey: ["me"] });
      router.push("/teacher/dashboard");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos guardar tu selección.",
      );
    } finally {
      setBusy(false);
    }
  }
  const items = step === 1 ? filtered : step === 2 ? faculties : careers;
  const selectedId =
    step === 1
      ? selectedUniversity?.id
      : step === 2
        ? selectedFaculty?.id
        : selectedCareer?.id;
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <Image src="/aura-atlas.png" alt="" width={32} height={32} />
          <span>
            Aura Atlas<small>ESPACIO DOCENTE</small>
          </span>
        </Link>
        <Link href="/teacher/requests" className={styles.requests}>
          Mis solicitudes <ArrowRight size={13} />
        </Link>
      </header>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <p className={styles.eyebrow}>CONFIGURA TU ESPACIO</p>
          <h1>¿Dónde enseñas?</h1>
          <p>
            Ubica tu comunidad académica. Será el punto de partida para tus
            materias y contenidos.
          </p>
          <ol className={styles.stepper}>
            {["Universidad", "Facultad", "Carrera"].map((label, index) => (
              <li
                key={label}
                aria-current={step === index + 1 ? "step" : undefined}
                data-active={step >= index + 1}
              >
                <span>
                  {step > index + 1 ? <Check size={15} /> : `0${index + 1}`}
                </span>
                <div>
                  <strong>{label}</strong>
                  <small>
                    {index === 0
                      ? selectedUniversity?.name || "Encuentra tu institución"
                      : index === 1
                        ? selectedFaculty?.name || "Tu comunidad de enseñanza"
                        : selectedCareer?.name ||
                          "El programa en el que participas"}
                  </small>
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.sideNote}>
            <ShieldCheck size={19} />
            <p>
              ¿Tu institución aún no está?
              <br />
              Puedes crear un espacio privado mientras revisamos sus datos.
            </p>
          </div>
        </aside>
        <section className={styles.panel} aria-labelledby="selection-title">
          <div className={styles.panelHeader}>
            <span>PASO 0{step} / 03</span>
            <span>
              <span className={styles.dot} /> TU CONTEXTO ACADÉMICO
            </span>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.titleIcon}>
              {step === 2 ? (
                <Building2 size={23} />
              ) : (
                <GraduationCap size={23} />
              )}
            </div>
            <h2 id="selection-title">
              {step === 1
                ? "Selecciona tu universidad"
                : step === 2
                  ? "Ahora, tu facultad"
                  : "Elige tu carrera"}
            </h2>
            <p className={styles.description}>
              {step === 1
                ? "Busca el nombre o las siglas de tu institución."
                : step === 2
                  ? `Facultades de ${selectedUniversity?.name}.`
                  : `Carreras de ${selectedFaculty?.name}.`}
            </p>
            {step === 1 && (
              <div className={styles.search}>
                <Search size={17} />
                <input
                  type="search"
                  aria-label="Buscar universidad"
                  placeholder="Buscar por nombre o siglas…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            )}
            {loading ? (
              <div role="status" className={styles.empty}>
                <LoaderCircle size={24} className="animate-spin" />
                <p>Cargando instituciones…</p>
              </div>
            ) : items.length ? (
              <div className={styles.options}>
                {items.map((item) => {
                  const logo =
                    "logoUrl" in item && item.logoUrl
                      ? item.logoUrl.startsWith("http")
                        ? item.logoUrl
                        : `${API_URL}${item.logoUrl}`
                      : null;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selectedId === item.id}
                      className={styles.option}
                      onClick={() => {
                        setError("");
                        if (step === 1)
                          setSelectedUniversity(
                            item as (typeof universities)[number],
                          );
                        else if (step === 2)
                          setSelectedFaculty(
                            item as (typeof faculties)[number],
                          );
                        else
                          setSelectedCareer(item as (typeof careers)[number]);
                      }}
                    >
                      <span className={styles.optionIcon}>
                        {logo ? (
                          <Image
                            src={logo}
                            alt=""
                            width={27}
                            height={27}
                            unoptimized
                          />
                        ) : (
                          <Building2 size={21} />
                        )}
                      </span>
                      <span className={styles.optionCopy}>
                        <strong>{item.name}</strong>
                        <small>
                          {"abbreviation" in item && item.abbreviation
                            ? item.abbreviation
                            : step === 1
                              ? "Institución de educación superior"
                              : "Espacio académico"}
                          {"approvalStatus" in item &&
                          item.approvalStatus !== "APPROVED"
                            ? " · Privada, en revisión"
                            : ""}
                        </small>
                      </span>
                      <span className={styles.optionEnd}>
                        {selectedId === item.id ? (
                          <Check size={16} />
                        ) : (
                          <ArrowRight size={16} />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={styles.empty}>
                <Search size={25} />
                <h3>
                  {step === 1
                    ? "No encontramos coincidencias"
                    : "Todavía no hay opciones disponibles"}
                </h3>
                <p>
                  {step === 1
                    ? "Prueba con el nombre completo o las siglas. Si tu universidad aún no existe, puedes añadirla."
                    : "Revisa tu selección anterior. Aún no se han registrado opciones en este espacio académico."}
                </p>
              </div>
            )}
            {step <= 2 && (
              <div className={styles.createRow}>
                <div>
                  <strong>
                    {step === 1
                      ? "¿No encuentras tu universidad?"
                      : "¿No encuentras tu facultad?"}
                  </strong>
                  <p>Crea un espacio provisional y comienza a trabajar.</p>
                </div>
                <button type="button" onClick={() => setModal(true)}>
                  <Plus size={15} />{" "}
                  {step === 1 ? "Añadir universidad" : "Añadir facultad"}
                </button>
              </div>
            )}
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
          </div>
          <footer className={styles.panelFooter}>
            <button type="button" onClick={back} disabled={busy}>
              <ArrowLeft size={14} /> Atrás
            </button>
            <button
              type="button"
              className={styles.continue}
              onClick={finish}
              disabled={!selectedCareer || busy}
            >
              {busy ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <>
                  Entrar a mi espacio <ArrowRight size={15} />
                </>
              )}
            </button>
          </footer>
        </section>
      </div>
      <footer className={styles.footer}>
        TU PERSPECTIVA. TU COMUNIDAD. TU FORMA DE ENSEÑAR.
      </footer>
      <UniversityRequestModal
        key={selectedUniversity?.id || "university"}
        facultyUniversity={
          step === 2 && selectedUniversity ? selectedUniversity : undefined
        }
        open={modal}
        onOpenChange={setModal}
        onSuccess={() => {
          setModal(false);
          void client.invalidateQueries();
          router.push("/teacher/dashboard");
        }}
      />
    </main>
  );
}
