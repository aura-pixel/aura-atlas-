"use client";

import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent, type MouseEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import {
  LearningGarden,
  Butterfly,
} from "@/components/landing/learning-garden";
import { get, post } from "@/lib/api";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import styles from "./auth-experience.module.css";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  server?: string;
};

export function AuthExperience() {
  const client = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const isRegister = pathname === "/register";
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{
    path: string;
    errors: FormErrors;
  }>({ path: pathname, errors: {} });
  const errors = feedback.path === pathname ? feedback.errors : {};

  function switchMode(event: MouseEvent<HTMLAnchorElement>) {
    if (busy) {
      event.preventDefault();
      return;
    }
    setFeedback({ path: pathname, errors: {} });
    setShowPassword(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = (isRegister ? registerSchema : loginSchema).safeParse(data);
    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      }
      setFeedback({ path: pathname, errors: nextErrors });
      const firstField = parsed.error.issues[0]?.path[0];
      if (typeof firstField === "string")
        (
          event.currentTarget.elements.namedItem(
            firstField,
          ) as HTMLInputElement | null
        )?.focus();
      return;
    }
    if (new TextEncoder().encode(parsed.data.password).length > 72) {
      setFeedback({
        path: pathname,
        errors: {
          password:
            "La contraseña es demasiado larga. Usa hasta 72 bytes; los acentos y símbolos pueden ocupar más de uno.",
        },
      });
      return;
    }
    setFeedback({ path: pathname, errors: {} });
    setBusy(true);
    try {
      if (isRegister) {
        await post("/auth/register", parsed.data);
        localStorage.removeItem("auth");
      }
      const response = await post<{ user: { role: string } }>("/auth/login", {
        email: parsed.data.email,
        password: parsed.data.password,
      });
      localStorage.removeItem("auth");
      client.clear();
      if (response.user.role === "SUPER_ADMIN") {
        router.push("/dashboard");
        return;
      }
      const profile = await get<{ careers: unknown[] }>("/users/me");
      router.push(
        profile.careers.length > 0 ? "/teacher/dashboard" : "/welcome",
      );
    } catch (error) {
      setFeedback({
        path: pathname,
        errors: {
          server:
            error instanceof Error
              ? error.message
              : "No pudimos completar la solicitud. Inténtalo de nuevo.",
        },
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page} data-mode={isRegister ? "register" : "login"}>
      <div className={styles.landscape} aria-hidden="true">
        <div className={styles.pinkCloud} />
        <div className={styles.blueCloud} />
        <div className={styles.hillOne} />
        <div className={styles.hillTwo} />
        <svg className={styles.botanicalLeft} viewBox="0 0 230 500" fill="none">
          <g stroke="#8b9aaa" strokeWidth="2">
            <path
              d="M75 500C165 335 48 201 139 50M116 308C59 310 14 263 22 226C77 232 110 264 116 308ZM107 216C168 206 201 165 195 128C148 141 114 173 107 216ZM111 145C72 116 67 80 80 55C111 75 128 108 111 145ZM125 84C121 46 148 18 169 14C170 48 150 75 125 84Z"
              fill="#8b9aaa"
              fillOpacity=".35"
            />
            <path d="M22 500Q47 420 13 355M32 461Q76 419 75 390M161 500Q153 443 186 399" />
          </g>
          <g fill="#e8afc0" stroke="#4a1115" strokeWidth="1.2">
            <ellipse cx="138" cy="42" rx="10" ry="23" />
            <ellipse
              cx="138"
              cy="42"
              rx="10"
              ry="23"
              transform="rotate(60 138 42)"
            />
            <ellipse
              cx="138"
              cy="42"
              rx="10"
              ry="23"
              transform="rotate(120 138 42)"
            />
            <circle cx="138" cy="42" r="6" fill="#4a1115" />
          </g>
        </svg>
        <svg
          className={styles.botanicalRight}
          viewBox="0 0 230 500"
          fill="none"
        >
          <path
            d="M115 500Q74 350 137 192M117 347Q48 338 40 280Q101 288 117 347ZM118 299Q171 290 185 238Q133 245 118 299ZM129 223Q93 177 113 138Q145 176 129 223Z"
            fill="#e8afc0"
            fillOpacity=".6"
            stroke="#8b9aaa"
            strokeWidth="2"
          />
          <path
            d="M186 500Q151 427 198 350M37 500Q19 443 40 415"
            stroke="#8b9aaa"
            strokeWidth="2"
          />
        </svg>
        <Butterfly className={styles.backgroundButterfly} />
      </div>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          <Image src="/aura-atlas.png" alt="" width={34} height={34} priority />
          <span>
            Aura Atlas<small>EL CONOCIMIENTO CONECTA</small>
          </span>
        </Link>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={15} /> Volver a explorar
        </Link>
      </header>
      <div className={styles.stage}>
        <div className={styles.glass}>
          <aside className={styles.story} aria-label="Inspiración para enseñar">
            <div className={styles.storySurface} />
            <div className={styles.storyTop}>
              <span>
                <Leaf size={14} /> UN ESPACIO PARA CRECER
              </span>
              <span className={styles.chapter}>
                {isRegister ? "02" : "01"} / ATLAS
              </span>
            </div>
            <div className={styles.storyHeading}>
              <p>
                {isRegister
                  ? "TODA GRAN IDEA TIENE UN COMIENZO"
                  : "QUÉ BONITO VOLVER A CONECTAR"}
              </p>
              <h2>
                {isRegister ? (
                  <>
                    Una pequeña idea.
                    <br />
                    Un mundo <em>por descubrir.</em>
                  </>
                ) : (
                  <>
                    Enseñar es sembrar
                    <br />
                    lo que mañana <em>florecerá.</em>
                  </>
                )}
              </h2>
            </div>
            <div className={styles.illustration}>
              <LearningGarden />
              <span className={styles.ideaTag}>
                <BookOpen size={15} />{" "}
                {isRegister
                  ? "Aquí empieza tu próxima idea"
                  : "Tus ideas siguen creciendo"}
              </span>
            </div>
            <div className={styles.storyFoot}>
              <span className={styles.storyLine} />
              <p>
                {isRegister
                  ? "Tu perspectiva puede abrir nuevos caminos."
                  : "Cada conexión abre una nueva forma de aprender."}
              </p>
              <span className={styles.littleFlower}>✳</span>
            </div>
          </aside>
          <section className={styles.formPanel} aria-labelledby="access-title">
            <div className={styles.formContent}>
              <nav
                className={styles.modeSwitch}
                aria-label="Acceso a tu cuenta"
              >
                <span className={styles.modeIndicator} />
                <Link
                  href="/login"
                  scroll={false}
                  aria-current={!isRegister ? "page" : undefined}
                  onClick={switchMode}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  scroll={false}
                  aria-current={isRegister ? "page" : undefined}
                  onClick={switchMode}
                >
                  Crear cuenta
                </Link>
              </nav>
              <div className={styles.formHeading}>
                <p className={styles.eyebrow}>
                  {isRegister ? "TU NUEVO CAPÍTULO" : "TU UNIVERSO TE ESPERA"}
                </p>
                <h1 id="access-title">
                  {isRegister ? (
                    <>
                      Hagamos espacio
                      <br />
                      para <em>tus ideas.</em>
                    </>
                  ) : (
                    <>
                      Qué gusto
                      <br />
                      <em>tenerte de vuelta.</em>
                    </>
                  )}
                </h1>
                <p>
                  {isRegister
                    ? "Empieza hoy. Tendrás cinco días para verificar tu correo sin interrumpir tu trabajo."
                    : "Entra a tu espacio y continúa donde lo dejaste."}
                </p>
              </div>
              <form
                onSubmit={onSubmit}
                noValidate
                className={styles.form}
                aria-busy={busy}
              >
                <div className={styles.nameReveal} inert={!isRegister}>
                  <div>
                    <div className={styles.field}>
                      <label htmlFor="name">Tu nombre</label>
                      <div className={styles.inputWrap}>
                        <UserRound size={16} />
                        <input
                          id="name"
                          name="name"
                          autoComplete="name"
                          placeholder="¿Cómo te llamas?"
                          disabled={!isRegister || busy}
                          aria-invalid={!!errors.name}
                          aria-describedby={
                            errors.name ? "name-error" : undefined
                          }
                        />
                      </div>
                      {errors.name && (
                        <p id="name-error" className={styles.fieldError}>
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="email">Correo electrónico</label>
                  <div className={styles.inputWrap}>
                    <Mail size={16} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="tu.correo@ejemplo.com"
                      disabled={busy}
                      aria-invalid={!!errors.email}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className={styles.fieldError}>
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="password">Contraseña</label>
                  <div className={styles.inputWrap}>
                    <LockKeyhole size={16} />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        isRegister ? "new-password" : "current-password"
                      }
                      placeholder={
                        isRegister ? "Al menos 12 caracteres" : "Tu contraseña"
                      }
                      disabled={busy}
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password
                          ? "password-error"
                          : isRegister
                            ? "password-hint"
                            : undefined
                      }
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      aria-pressed={showPassword}
                      disabled={busy}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p id="password-error" className={styles.fieldError}>
                      {errors.password}
                    </p>
                  ) : (
                    isRegister && (
                      <p id="password-hint" className={styles.hint}>
                        Una buena idea empieza con una contraseña segura.
                      </p>
                    )
                  )}
                </div>
                {errors.server && (
                  <div role="alert" className={styles.serverError}>
                    {errors.server}
                    {errors.server.toLowerCase().includes("verifica") && (
                      <Link href="/verify-email"> Verificar mi correo →</Link>
                    )}
                  </div>
                )}
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <LoaderCircle size={17} className={styles.spinner} />{" "}
                      {isRegister
                        ? "Creando tu espacio…"
                        : "Entrando a tu espacio…"}
                    </>
                  ) : (
                    <>
                      {isRegister ? "Crear mi cuenta" : "Iniciar sesión"}
                      <ArrowUpRight size={18} />
                    </>
                  )}
                </button>
              </form>
              <p className={styles.switchPrompt}>
                {isRegister
                  ? "¿Ya tienes un espacio aquí?"
                  : "¿Es tu primera vez por aquí?"}{" "}
                <Link
                  href={isRegister ? "/login" : "/register"}
                  scroll={false}
                  onClick={switchMode}
                >
                  {isRegister ? "Inicia sesión" : "Crea tu cuenta"}
                  <ArrowRight size={13} />
                </Link>
              </p>
              <div className={styles.formFoot}>
                {isRegister ? (
                  <>
                    <Check size={13} />
                    <span>Un espacio propio. Muchas formas de enseñar.</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole size={12} />
                    <span>Tus ideas, en un espacio seguro.</span>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      <footer className={styles.pageFooter}>
        <span>CULTIVA IDEAS. COMPARTE CONOCIMIENTO.</span>
        <span>
          Hecho con intención por{" "}
          <a
            href="https://tzalli-studio.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tzalli Studio <ArrowUpRight size={12} />
          </a>
        </span>
      </footer>
    </main>
  );
}
