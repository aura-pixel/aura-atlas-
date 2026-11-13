import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  GraduationCap,
  Link2,
  Sprout,
} from "lucide-react";
import {
  Butterfly,
  LearningGarden,
} from "@/components/landing/learning-garden";
import styles from "./welcome.module.css";

export const metadata: Metadata = {
  title: "Tu nuevo espacio docente | Aura Atlas",
};

const firstSteps = [
  {
    number: "01",
    icon: GraduationCap,
    title: "Encuentra tu comunidad",
    description: "Tu universidad y tu carrera son el punto de partida.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Dale lugar a tus ideas",
    description: "Elige una materia o crea una que aún no exista.",
  },
  {
    number: "03",
    icon: Link2,
    title: "Conecta tu conocimiento",
    description: "Reúne temas y recursos con tu propia perspectiva.",
  },
];

export default function WelcomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.background} aria-hidden="true">
        <div className={styles.pinkCloud} />
        <div className={styles.blueCloud} />
        <svg
          className={styles.meadow}
          viewBox="0 0 1440 210"
          fill="none"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d="M0 135C300 238 454 49 800 115S1220 220 1440 114V210H0Z"
            fill="#e8afc0"
            fillOpacity=".16"
          />
          <path
            d="M0 190C310 105 560 205 830 162S1250 97 1440 180V210H0Z"
            fill="#8b9aaa"
            fillOpacity=".12"
          />
          <g stroke="#8b9aaa" strokeWidth="2">
            <path
              d="M45 210Q92 134 55 56M67 148Q25 144 15 109Q53 112 67 148ZM69 111Q110 92 111 64Q78 73 69 111ZM1379 210Q1349 140 1390 65M1369 145Q1332 123 1332 93Q1365 100 1369 145ZM1375 116Q1410 107 1420 78Q1394 79 1375 116Z"
              fill="#8b9aaa"
              fillOpacity=".32"
            />
          </g>
          <g fill="#e8afc0" stroke="#4a1115" strokeWidth="1">
            <ellipse cx="54" cy="48" rx="8" ry="19" />
            <ellipse
              cx="54"
              cy="48"
              rx="8"
              ry="19"
              transform="rotate(60 54 48)"
            />
            <ellipse
              cx="54"
              cy="48"
              rx="8"
              ry="19"
              transform="rotate(120 54 48)"
            />
            <circle cx="54" cy="48" r="5" fill="#4a1115" />
          </g>
        </svg>
      </div>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Aura Atlas, inicio">
          <Image src="/aura-atlas.png" width={35} height={35} alt="" priority />
          <span>
            Aura Atlas<small>EL CONOCIMIENTO CONECTA</small>
          </span>
        </Link>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={14} /> Volver a explorar
        </Link>
      </header>
      <div className={styles.content}>
        <div className={styles.chapter}>
          <span>
            <span className={styles.statusDot} /> TU PRIMER CAPÍTULO
          </span>
          <span>
            UN COMIENZO LLENO DE POSIBILIDADES <Sprout size={14} />
          </span>
        </div>
        <div className={styles.glass}>
          <div className={styles.hero}>
            <section className={styles.copy} aria-labelledby="welcome-title">
              <span className={styles.welcomeBadge}>
                <Sprout size={14} /> BIENVENIDO A AURA ATLAS
              </span>
              <h1 id="welcome-title">
                Tu forma de enseñar
                <br />
                tiene un <em>nuevo hogar.</em>
              </h1>
              <p>
                Qué bonito que estés aquí. Este es tu espacio para cultivar
                ideas, conectar lo que sabes y dar vida a nuevas formas de
                aprender.
              </p>
              <div className={styles.nextStep}>
                <span className={styles.nextIcon}>
                  <GraduationCap size={21} />
                </span>
                <div>
                  <strong>Primero, hagámoslo tuyo.</strong>
                  <p>
                    Cuéntanos un poco de ti y encuentra tu espacio académico.
                    Después vendrán las grandes ideas.
                  </p>
                </div>
              </div>
              <Link href="/teacher" className={styles.primaryButton}>
                Configurar mi espacio <ArrowUpRight size={19} />
              </Link>
              <span className={styles.reassurance}>
                <Check size={13} /> No necesitas tenerlo todo listo para
                empezar.
              </span>
            </section>
            <div className={styles.visual}>
              <span className={styles.visualEyebrow}>
                AQUÍ, CADA IDEA PUEDE CRECER
              </span>
              <div className={styles.art}>
                <LearningGarden />
              </div>
              <div className={`${styles.floatingCard} ${styles.spaceCard}`}>
                <span className={styles.cardIcon}>
                  <Sprout size={20} />
                </span>
                <div>
                  <small>UN LUGAR CON TU PERSPECTIVA</small>
                  <strong>Tu espacio docente</strong>
                </div>
                <span className={styles.checkBadge}>
                  <Check size={12} />
                </span>
              </div>
              <div className={`${styles.floatingCard} ${styles.ideaCard}`}>
                <Link2 size={15} />
                <span>Una idea lleva a otra.</span>
              </div>
              <Butterfly className={styles.extraButterfly} />
              <span className={styles.caption}>
                Lo que sabes puede abrir nuevos caminos.
              </span>
            </div>
          </div>
          <section className={styles.journey} aria-labelledby="journey-title">
            <div className={styles.journeyHeading}>
              <h2 id="journey-title">
                Un pequeño recorrido.
                <br />
                <em>Muchas posibilidades.</em>
              </h2>
              <span>ASÍ EMPIEZA TU UNIVERSO</span>
            </div>
            <ol className={styles.steps}>
              {firstSteps.map(({ number, icon: Icon, title, description }) => (
                <li key={number}>
                  <div className={styles.stepTop}>
                    <span className={styles.stepNumber}>{number}</span>
                    <Icon size={18} />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <p className={styles.bottomNote}>
          <span className={styles.littleFlower}>✳</span> Tu perspectiva es el
          punto de partida. El resto, lo construyes a tu ritmo.
        </p>
      </div>
      <footer className={styles.footer}>
        <span>CULTIVA IDEAS. COMPARTE CONOCIMIENTO.</span>
        <a
          href="https://tzalli-studio.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hecho por Tzalli Studio <ArrowRight size={12} />
        </a>
      </footer>
    </main>
  );
}
