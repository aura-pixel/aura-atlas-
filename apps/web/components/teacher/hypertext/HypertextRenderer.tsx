"use client";
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Compass,
  FileText,
  GraduationCap,
  Layers,
  Map,
  MapPin,
  UserRound,
} from "lucide-react";
import { Butterfly } from "@/components/landing/learning-garden";
import { API_URL, assetUrl } from "@/lib/config";
import { patch, postForm } from "@/lib/api";
import { getSubjectTextColor } from "@/lib/subject-colors";
import { UnitImageEditorContext } from "./unit-image-editor-context";
import type { AtlasHypertext, AtlasUnit } from "./atlas-types";
import { LearningJourney } from "./LearningJourney";
import styles from "./learning-atlas.module.css";
const loading = () => (
  <div className={styles.empty} role="status">
    Preparando tu siguiente parada…
  </div>
);
const UnitWorkspace = dynamic(
  () => import("./UnitWorkspace").then((module) => module.UnitWorkspace),
  { loading },
);
export type HypertextRendererProps = {
  hypertext: AtlasHypertext;
  mode?: "editor" | "public";
  scrollContainerId?: string;
};
type View =
  | { type: "landing" }
  | { type: "unit"; unitId: string }
  | { type: "topic"; unitId: string; topicId: string }
  | { type: "material"; unitId: string; topicId: string; materialId: string };
function imageSource(unit: AtlasUnit) {
  if (!unit.imageUrl) return null;
  return unit.imageUrl.startsWith("users/")
    ? `${API_URL}/hypertexts/unit-images/${unit.id}?v=${encodeURIComponent(unit.updatedAt ?? "1")}`
    : assetUrl(unit.imageUrl);
}
export function HypertextRenderer({
  hypertext,
  mode = "editor",
  scrollContainerId,
}: HypertextRendererProps) {
  const root = useRef<HTMLDivElement>(null),
    menu = useRef<HTMLDivElement>(null),
    menuButton = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState<View>({ type: "landing" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [draftImages, setDraftImages] = useState<Record<string, string | null>>(
    {},
  );
  const openImage = useContext(UnitImageEditorContext);
  const editable = mode === "editor" && !!openImage;
  const { subject } = hypertext;
  const { career } = subject;
  const { faculty } = career;
  const { university } = faculty;
  const dark = hypertext.theme === "DARK";
  const units = useMemo(
    () =>
      hypertext.units
        .filter(
          (unit) => unit.topics.some((topic) => topic.materials.length > 0),
        )
        .map((unit) => ({
          ...unit,
          imageUrl: Object.prototype.hasOwnProperty.call(draftImages, unit.id)
            ? draftImages[unit.id]
            : Object.prototype.hasOwnProperty.call(images, unit.id)
              ? images[unit.id]
              : imageSource(unit),
          topics: unit.topics.filter((topic) => topic.materials.length > 0),
        })),
    [hypertext.units, images, draftImages],
  );
  const currentUnit =
    "unitId" in view
      ? units.find((unit) => unit.id === view.unitId)
      : undefined;
  const currentTopic =
    currentUnit && "topicId" in view
      ? currentUnit.topics.find((topic) => topic.id === view.topicId)
      : undefined;
  const currentMaterial =
    currentTopic && "materialId" in view
      ? currentTopic.materials.find(
          (material) => material.id === view.materialId,
        )
      : undefined;
  function top() {
    const container = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : null;
    (container ?? window).scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  function go(next: View, anchor?: string, scroll = true) {
    setView(next);
    setMenuOpen(false);
    if (mode === "public") {
      const hash =
        next.type === "landing"
          ? anchor
            ? `#${anchor}`
            : ""
          : "#" +
            new URLSearchParams({
              unidad: next.unitId,
              ...("topicId" in next ? { tema: next.topicId } : {}),
              ...("materialId" in next ? { recurso: next.materialId } : {}),
            }).toString();
      window.history.pushState(
        {},
        "",
        window.location.pathname + window.location.search + hash,
      );
    }
    if (!scroll) return;
    requestAnimationFrame(() => {
      if (anchor)
        document.getElementById(`${hypertext.id}-${anchor}`)?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      else top();
    });
  }
  useEffect(() => {
    if (mode !== "public") return;
    const restore = () => {
      const hash = window.location.hash.slice(1),
        params = new URLSearchParams(hash);
      const unit = units.find((u) => u.id === params.get("unidad"));
      const topic = unit?.topics.find((t) => t.id === params.get("tema"));
      const material = topic?.materials.find(
        (m) => m.id === params.get("recurso"),
      );
      setView(
        material && topic && unit
          ? {
              type: "material",
              unitId: unit.id,
              topicId: topic.id,
              materialId: material.id,
            }
          : topic && unit
            ? { type: "topic", unitId: unit.id, topicId: topic.id }
            : unit
              ? { type: "unit", unitId: unit.id }
              : { type: "landing" },
      );
      setMenuOpen(false);
      requestAnimationFrame(() => {
        if (hash === "como-usarlo" || hash === "recorrido")
          document
            .getElementById(`${hypertext.id}-${hash}`)
            ?.scrollIntoView({ block: "start" });
        else top();
      });
    };
    restore();
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, [mode, units, hypertext.id, scrollContainerId]);
  useEffect(() => {
    if (!menuOpen) return;
    const outside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [menuOpen]);
  function menuKeys(event: KeyboardEvent<HTMLDivElement>) {
    const options = Array.from(
      menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ??
        [],
    );
    if (!options.length) return;
    const current = options.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let next;
    if (event.key === "ArrowDown") next = (current + 1) % options.length;
    else if (event.key === "ArrowUp")
      next =
        current < 0
          ? options.length - 1
          : (current + options.length - 1) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else return;
    event.preventDefault();
    options[next].focus();
  }
  function editImage(unit: AtlasUnit) {
    openImage?.({
      unitId: unit.id,
      title: `Unidad ${unit.number} · ${unit.title}`,
      imageUrl: unit.imageUrl ?? null,
      preview: (url) => {
        setDraftImages((current) => {
          const next = { ...current };
          if (url === undefined) delete next[unit.id];
          else next[unit.id] = url;
          return next;
        });
      },
      apply: async (imageUrl) => {
        await patch(`/hypertexts/${hypertext.id}/units/${unit.id}/image`, {
          imageUrl,
        });
        setImages((current) => ({ ...current, [unit.id]: imageUrl }));
      },
      upload: async (file) => {
        const body = new FormData();
        body.append("image", file);
        const saved = await postForm<AtlasUnit>(
          `/hypertexts/${hypertext.id}/units/${unit.id}/image`,
          body,
        );
        setImages((current) => ({ ...current, [unit.id]: imageSource(saved) }));
      },
    });
  }
  const properties = {
    "--accent": hypertext.primaryColor,
    "--accent-ink": getSubjectTextColor(hypertext.primaryColor),
    "--secondary": hypertext.secondaryColor,
    "--page": dark ? "#1c232b" : "#f8f5ee",
    "--surface": dark ? "#27303a" : "#fffdf8",
    "--ink": dark ? "#f2eee7" : "#422b33",
    "--muted": dark ? "#b5b9ba" : "#8a7680",
    "--line": dark ? "#ffffff19" : "#4a111516",
    "--soft": dark ? "#303945" : "#eee8e1",
    fontFamily: hypertext.fontFamily,
    colorScheme: dark ? "dark" : "light",
  } as CSSProperties;
  return (
    <div
      ref={root}
      className={styles.atlas}
      data-theme={dark ? "dark" : "light"}
      style={properties}
    >
      <nav className={styles.navbar} aria-label="Navegación del hipertexto">
        <button
          type="button"
          className={styles.brand}
          onClick={() => go({ type: "landing" })}
        >
          <span>
            <BookOpen size={21} strokeWidth={1.3} />
          </span>
          <div>
            <small>{university.abbreviation || "AURA ATLAS"}</small>
            <strong>{subject.name}</strong>
          </div>
        </button>
        <div className={styles.navLinks}>
          <button
            type="button"
            aria-current={view.type === "landing" ? "page" : undefined}
            onClick={() => go({ type: "landing" })}
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => go({ type: "landing" }, "como-usarlo")}
          >
            Cómo usarlo
          </button>
          <div className={styles.unitMenu} ref={menu} onKeyDown={menuKeys}>
            <button
              type="button"
              ref={menuButton}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={`${hypertext.id}-unit-menu`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              Unidades <ChevronDown size={13} data-open={menuOpen} />
            </button>
            {menuOpen && (
              <div
                role="menu"
                id={`${hypertext.id}-unit-menu`}
                className={styles.unitDropdown}
              >
                <span className={styles.eyebrow}>
                  ELIGE TU SIGUIENTE PARADA
                </span>
                {units.map((unit) => (
                  <button
                    type="button"
                    role="menuitem"
                    key={unit.id}
                    aria-current={
                      currentUnit?.id === unit.id ? "page" : undefined
                    }
                    onClick={() => go({ type: "unit", unitId: unit.id })}
                  >
                    <span>{String(unit.number).padStart(2, "0")}</span>
                    <div>
                      <small>Unidad {unit.number}</small>
                      <strong>{unit.title}</strong>
                    </div>
                    <ArrowRight size={13} />
                  </button>
                ))}
                {!units.length && <p>Todavía no hay unidades disponibles.</p>}
              </div>
            )}
          </div>
        </div>
      </nav>
      {view.type === "landing" ? (
        <>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                <GraduationCap size={14} /> UN ATLAS PARA TU APRENDIZAJE
              </span>
              <h1>{subject.name}</h1>
              <p className={styles.intro}>
                {hypertext.description ||
                  `Una invitación a explorar los temas de ${subject.name}, descubrir nuevas ideas y conectar lo que aprendes con sus materiales.`}
              </p>
              <span className={styles.author}>
                <UserRound size={14} /> Un hipertexto de{" "}
                <strong>{hypertext.user.name}</strong>
              </span>
              <button
                type="button"
                className={styles.primary}
                onClick={() => go({ type: "landing" }, "recorrido")}
              >
                Explorar el recorrido <ArrowRight size={16} />
              </button>
            </div>
            <div className={styles.heroArt}>
              {hypertext.coverImageUrl ? (
                <img
                  src={assetUrl(hypertext.coverImageUrl)}
                  alt={`Portada de ${subject.name}`}
                  decoding="async"
                  className={styles.coverImage}
                />
              ) : (
                <div className={styles.coverBook}>
                  <BookOpen size={42} strokeWidth={1.1} />
                  <span>EXPLORA · CONECTA · APRENDE</span>
                  <strong>{subject.name}</strong>
                  <i />
                </div>
              )}
              <Butterfly className={styles.butterfly} />
              <span className={styles.artLabel}>
                <Compass size={13} /> Cada idea abre un camino.
              </span>
            </div>
          </header>
          <section
            className={styles.academicIdentity}
            aria-label="Contexto académico"
          >
            <dl>
              <div>
                <dt>Universidad</dt>
                <dd>{university.name}</dd>
              </div>
              <div>
                <dt>Facultad</dt>
                <dd>{faculty.name}</dd>
              </div>
              <div>
                <dt>Carrera</dt>
                <dd>{career.name}</dd>
              </div>
              <div>
                <dt>Materia</dt>
                <dd>{subject.name}</dd>
              </div>
            </dl>
          </section>
          {hypertext.academicStructure?.subjectObjective && (
            <section className={styles.subjectObjective}>
              <span className={styles.eyebrow}>LO QUE VAS A APRENDER</span>
              <p>{hypertext.academicStructure.subjectObjective}</p>
            </section>
          )}
          <section className={styles.guide} id={`${hypertext.id}-como-usarlo`}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>
                ANTES DE EMPRENDER EL VIAJE
              </span>
              <h2>
                Un recorrido, <em>a tu ritmo.</em>
              </h2>
              <p>
                No tienes que seguir una sola ruta. Puedes volver a los temas y
                consultar los recursos cuando los necesites.
              </p>
            </div>
            <div className={styles.guideGrid}>
              {[
                {
                  icon: Map,
                  title: "Elige una unidad",
                  text: "Usa el mapa o abre el menú Unidades para encontrar por dónde empezar.",
                },
                {
                  icon: Layers,
                  title: "Explora sus temas",
                  text: "Descubre los objetivos de cada unidad y abre el tema que quieras consultar.",
                },
                {
                  icon: FileText,
                  title: "Conecta con sus recursos",
                  text: "Lee, mira o escucha sus materiales. Vuelve a la unidad para seguir explorando.",
                },
              ].map((item, index) => (
                <article key={item.title}>
                  <div>
                    <item.icon size={23} strokeWidth={1.3} />
                    <span>0{index + 1}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>
          <section
            className={styles.mapSection}
            id={`${hypertext.id}-recorrido`}
          >
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>
                <MapPin size={13} /> TU MAPA DE CONOCIMIENTO
              </span>
              <h2>
                Cada unidad, <em>un lugar por descubrir.</em>
              </h2>
              <p>Elige un marcador y comienza a explorar.</p>
            </div>
            <LearningJourney
              units={units}
              onOpen={(unit) => go({ type: "unit", unitId: unit.id })}
              onImage={editable ? editImage : undefined}
            />
          </section>
        </>
      ) : currentUnit ? (
        <UnitWorkspace
          key={currentUnit.id}
          unit={currentUnit}
          topic={currentTopic}
          material={currentMaterial}
          theme={hypertext.theme}
          onBack={() => go({ type: "landing" }, "recorrido")}
          onTopic={(topic) =>
            go(
              { type: "topic", unitId: currentUnit.id, topicId: topic.id },
              undefined,
              false,
            )
          }
          onMaterial={(topic, material) =>
            go(
              {
                type: "material",
                unitId: currentUnit.id,
                topicId: topic.id,
                materialId: material.id,
              },
              undefined,
              false,
            )
          }
          onImage={editable ? () => editImage(currentUnit) : undefined}
        />
      ) : (
        <div className={styles.empty}>
          Esta parte del recorrido no está disponible.
          <button type="button" onClick={() => go({ type: "landing" })}>
            Volver al inicio
          </button>
        </div>
      )}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div>
            <BookOpen size={27} strokeWidth={1.2} />
            <h2>{subject.name}</h2>
            <p>
              Creado por <strong>{hypertext.user.name}</strong>
            </p>
          </div>
          <div>
            <span className={styles.eyebrow}>UN ESPACIO PARA APRENDER</span>
            <p>
              {university.name}
              <br />
              {faculty.name}
              <br />
              {career.name}
            </p>
          </div>
          <div className={styles.footerLinks}>
            <button type="button" onClick={() => go({ type: "landing" })}>
              Inicio
            </button>
            <button
              type="button"
              onClick={() => go({ type: "landing" }, "como-usarlo")}
            >
              Cómo usarlo
            </button>
            <button
              type="button"
              onClick={() => go({ type: "landing" }, "recorrido")}
            >
              Ver recorrido
            </button>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>Hecho con Aura Atlas</span>
          <span>Explorar también es aprender.</span>
        </div>
      </footer>
    </div>
  );
}
