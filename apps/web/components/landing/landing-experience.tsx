"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  FileText,
  Layers3,
  Link2,
  Menu,
  Play,
  Sparkles,
  Sprout,
  X,
} from "lucide-react";
import styles from "./landing.module.css";
import { Butterfly, LearningGarden } from "./learning-garden";

function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className={styles.header}>
      <a href="#contenido" className={styles.skipLink}>
        Ir al contenido
      </a>
      <div className={styles.navbar}>
        <Link href="/" className={styles.brand} aria-label="Aura Atlas, inicio">
          <Image src="/aura-atlas.png" width={38} height={38} alt="" priority />
          <span>
            Aura Atlas<small>EL CONOCIMIENTO CONECTA</small>
          </span>
        </Link>
        <nav className={styles.desktopNav} aria-label="Navegación principal">
          <a href="#que-es">El universo Atlas</a>
          <a href="#como-funciona">Cómo funciona</a>
        </nav>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.loginLink}>
            Iniciar sesión
          </Link>
          <Link href="/register" className={styles.navCta}>
            Comenzar <ArrowUpRight size={15} />
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="landing-mobile-menu"
          className={styles.mobileNav}
          aria-label="Navegación móvil"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          <a href="#que-es" onClick={() => setOpen(false)}>
            El universo Atlas
          </a>
          <a href="#como-funciona" onClick={() => setOpen(false)}>
            Cómo funciona
          </a>
          <Link href="/login" onClick={() => setOpen(false)}>
            Iniciar sesión <ArrowUpRight size={16} />
          </Link>
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span /> UN ESPACIO PARA ENSEÑAR Y EXPLORAR
          </p>
          <h1 id="hero-title">
            Las ideas conectan.
            <br />
            El conocimiento <em>florece.</em>
          </h1>
          <p className={styles.heroDescription}>
            Dale vida a tu forma de enseñar. Organiza tus materias, conecta tus
            recursos y crea nuevas rutas de aprendizaje con Aura Atlas.
          </p>
          <div className={styles.actions}>
            <Link href="/register" className={styles.primaryButton}>
              Comienza a crear <ArrowUpRight size={19} />
            </Link>
            <a href="#como-funciona" className={styles.textButton}>
              Descubre cómo <ArrowDown size={16} />
            </a>
          </div>
          <div className={styles.heroNote}>
            <span className={styles.noteIcon}>
              <BookOpen size={17} />
            </span>
            <span>
              Tu materia. Tu perspectiva.
              <br />
              <strong>Un mundo de posibilidades.</strong>
            </span>
          </div>
        </div>
        <div className={styles.gardenWorld}>
          <div className={styles.gardenLabel}>
            <span /> UN PEQUEÑO UNIVERSO DE CONOCIMIENTO
          </div>
          <LearningGarden />
          <div className={`${styles.floatingCard} ${styles.subjectCard}`}>
            <span className={styles.cardIcon}>
              <BookOpen size={19} />
            </span>
            <div>
              <small>TODO COMIENZA CON UNA IDEA</small>
              <strong>Tu próxima materia</strong>
            </div>
            <ArrowUpRight size={16} />
          </div>
          <div className={`${styles.floatingCard} ${styles.resourceCard}`}>
            <span className={styles.cardIcon}>
              <Layers3 size={18} />
            </span>
            <div>
              <strong>Conecta lo que enseñas</strong>
              <small>Temas · Recursos · Hipertextos</small>
            </div>
            <span className={styles.cardDot} />
          </div>
          <span className={styles.gardenCaption}>
            Cultiva ideas. Comparte conocimiento.
          </span>
        </div>
      </div>
      <div className={styles.heroBottom}>
        <a href="#que-es">
          <span className={styles.scrollCircle}>
            <ArrowDown size={15} />
          </span>{" "}
          HAY MUCHO POR EXPLORAR
        </a>
        <span>
          HECHO PARA MENTES CURIOSAS <span className={styles.smallStar}>✳</span>
        </span>
      </div>
      <svg
        className={styles.heroWave}
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 50C210 115 420 5 720 40S1190 110 1440 20V90H0Z"
          fill="#eee7df"
        />
      </svg>
      <svg
        className={styles.meadow}
        viewBox="0 0 1440 120"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="#8b9aaa" strokeWidth="1.5" strokeLinecap="round">
          <path d="M25 104Q30 55 14 34M25 104Q9 78 0 78M41 108Q45 77 57 65M61 112Q68 60 91 47M62 112Q58 88 46 84M95 116Q90 92 81 88M1378 93Q1370 39 1346 25M1378 93Q1385 64 1404 52M1399 84Q1405 47 1415 37M1427 74Q1421 44 1430 23" />
        </g>
        <g fill="#8b9aaa">
          <path d="M62 90Q32 68 31 53Q55 56 62 90M1373 69Q1348 67 1339 46Q1363 46 1373 69" />
        </g>
        <g stroke="#4a1115" strokeWidth="1.2" fill="#e8afc0">
          <circle cx="88" cy="36" r="10" />
          <circle cx="101" cy="43" r="10" />
          <circle cx="89" cy="52" r="10" />
          <circle cx="78" cy="44" r="10" />
          <circle cx="89" cy="44" r="4" fill="#4a1115" />
        </g>
      </svg>
    </section>
  );
}

function Features() {
  return (
    <section id="que-es" className={styles.features}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeading} data-reveal>
          <div>
            <p className={styles.eyebrow}>EL UNIVERSO ATLAS</p>
            <h2>
              El aprendizaje no es una línea.
              <br />
              <em>Es todo un ecosistema.</em>
            </h2>
          </div>
          <p>
            Una materia puede abrir muchos caminos. Aura Atlas te ayuda a darles
            forma y a conectar cada idea con la siguiente.
          </p>
        </div>
        <div className={styles.featureGrid}>
          <article
            className={`${styles.featureCard} ${styles.organizeCard}`}
            data-reveal
          >
            <div className={styles.featureTop}>
              <span>
                <BookOpen size={20} />
              </span>
              <small>01 / DALE ESTRUCTURA</small>
            </div>
            <div className={styles.miniTree} aria-hidden="true">
              <span>Tu materia</span>
              <i />
              <div>
                <span>Unidad 01</span>
                <span>Unidad 02</span>
              </div>
              <div className={styles.treeLeaves}>
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <h3>Un lugar para cada idea.</h3>
            <p>
              Organiza tus materias en unidades, temas y subtemas. Construye una
              estructura que tenga sentido para ti.
            </p>
            <span className={styles.cardFooter}>
              ORGANIZA <ArrowUpRight size={17} />
            </span>
          </article>
          <article
            className={`${styles.featureCard} ${styles.createCard}`}
            data-reveal
          >
            <div className={styles.featureTop}>
              <span>
                <Sparkles size={20} />
              </span>
              <small>02 / HAZLO TUYO</small>
            </div>
            <div className={styles.resourceStack} aria-hidden="true">
              <span>
                <FileText size={18} /> Lecturas que inspiran
              </span>
              <span>
                <Play size={17} /> Otra forma de entender
              </span>
              <span>
                <Link2 size={17} /> Una idea lleva a otra
              </span>
            </div>
            <h3>Tu forma de enseñar.</h3>
            <p>
              Reúne documentos, imágenes, videos y enlaces. Personaliza tu
              espacio y dale tu propia voz al contenido.
            </p>
            <span className={styles.cardFooter}>
              CREA <ArrowUpRight size={17} />
            </span>
          </article>
          <article
            className={`${styles.featureCard} ${styles.connectCard}`}
            data-reveal
          >
            <div className={styles.featureTop}>
              <span>
                <Link2 size={20} />
              </span>
              <small>03 / ABRE CAMINOS</small>
            </div>
            <div className={styles.nodeMap} aria-hidden="true">
              <svg viewBox="0 0 300 140">
                <path
                  d="M52 39L148 72L251 27M148 72L220 122M148 72L53 119"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="4 5"
                />
                <circle cx="52" cy="39" r="14" />
                <circle cx="251" cy="27" r="10" />
                <circle cx="220" cy="122" r="13" />
                <circle cx="53" cy="119" r="9" />
                <circle cx="148" cy="72" r="27" />
              </svg>
              <BookOpen size={22} />
            </div>
            <h3>Todo está conectado.</h3>
            <p>
              Transforma tus recursos en hipertextos: contenidos conectados que
              invitan a explorar el conocimiento.
            </p>
            <span className={styles.cardFooter}>
              CONECTA <ArrowUpRight size={17} />
            </span>
          </article>
        </div>
        <div className={styles.interlude} data-reveal>
          <span>
            Una idea se convierte en tema.
            <br />
            Un tema abre <em>un nuevo mundo.</em>
          </span>
          <svg viewBox="0 0 230 100" fill="none" aria-hidden="true">
            <path
              d="M5 65C75 65 63 3 107 20C157 43 76 111 66 74C58 40 166 43 213 25M202 20L216 24L209 37"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <p>
            No se trata solo de guardar información.
            <br />
            Se trata de descubrir lo que la conecta.
          </p>
        </div>
      </div>
    </section>
  );
}

const steps = [
  [
    "Encuentra tu comunidad",
    "Crea tu cuenta y elige tu universidad y tu carrera. Ese es el punto de partida.",
  ],
  [
    "Planta la primera idea",
    "Elige una materia o crea una nueva. Después, organiza sus temas y añade tus recursos.",
  ],
  [
    "Haz crecer tu universo",
    "Conecta tus contenidos, personaliza tu materia y construye tu propia experiencia de enseñanza.",
  ],
];

function HowItWorks() {
  return (
    <section id="como-funciona" className={styles.howSection}>
      <div className={styles.howInner}>
        <div className={styles.howIntro} data-reveal>
          <span className={styles.sproutBadge}>
            <Sprout size={28} />
          </span>
          <p className={styles.eyebrow}>DE LA IDEA A LA EXPERIENCIA</p>
          <h2>
            Todo lo que crece
            <br />
            empieza con <em>algo pequeño.</em>
          </h2>
          <p>
            No necesitas tenerlo todo listo. Empieza con una materia y deja que
            las conexiones tomen forma.
          </p>
          <Link href="/register" className={styles.primaryButton}>
            Crea tu primer espacio <ArrowUpRight size={18} />
          </Link>
        </div>
        <ol className={styles.steps}>
          {steps.map(([title, description], index) => (
            <li key={title} data-reveal>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGarden} aria-hidden="true">
        <svg viewBox="0 0 1440 130" preserveAspectRatio="none">
          <path
            d="M0 67C230 137 385-6 691 57S1196 127 1440 40V130H0Z"
            fill="#4a1115"
          />
          <g fill="none" stroke="#4a1115" strokeWidth="3">
            <path d="M130 95Q116 42 84 25M130 95Q139 54 156 37M1320 92Q1310 40 1279 18M1320 92Q1330 43 1358 34" />
          </g>
          <g fill="#4a1115">
            <ellipse
              cx="91"
              cy="31"
              rx="9"
              ry="22"
              transform="rotate(-40 91 31)"
            />
            <ellipse
              cx="150"
              cy="47"
              rx="8"
              ry="20"
              transform="rotate(37 150 47)"
            />
            <ellipse
              cx="1286"
              cy="30"
              rx="10"
              ry="24"
              transform="rotate(-38 1286 30)"
            />
            <ellipse
              cx="1350"
              cy="42"
              rx="9"
              ry="20"
              transform="rotate(43 1350 42)"
            />
          </g>
        </svg>
      </div>
      <div className={styles.footerInner}>
        <div className={styles.footerCta} data-reveal>
          <p className={styles.eyebrow}>EL SIGUIENTE CAPÍTULO LO ESCRIBES TÚ</p>
          <h2>
            Hagamos espacio
            <br />
            para <em>nuevas ideas.</em>
          </h2>
          <Link href="/register" className={styles.lightButton}>
            Empieza con Aura Atlas <ArrowUpRight size={19} />
          </Link>
          <Butterfly className={styles.footerButterfly} />
        </div>
        <div className={styles.footerBottom}>
          <Link href="/" className={styles.footerBrand}>
            <Image src="/aura-atlas.png" width={32} height={32} alt="" /> Aura
            Atlas
          </Link>
          <span>Un espacio donde el conocimiento florece.</span>
          <a
            href="https://tzalli-studio.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hecho por Tzalli Studio <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export function LandingExperience() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elements =
      root.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (
      !elements ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.setAttribute("data-animate", "true");
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={root} className={styles.landing}>
      <Navigation />
      <main id="contenido">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
