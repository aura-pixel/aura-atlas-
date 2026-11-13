"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { get, post } from "@/lib/api";

export default function VerifyEmail() {
  const [message, setMessage] = useState(
    "Tienes cinco días desde el registro para verificar tu correo. Puedes seguir trabajando durante ese plazo. El enlace de verificación vence en una hora; si caduca, solicita uno nuevo.",
  );
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [continueTo, setContinueTo] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    let active = true;
    setHasToken(new URLSearchParams(window.location.search).has("token"));
    get<{ email: string; role: string }>("/auth/me")
      .then(async (user) => {
        if (active) setEmail(user.email);
        if (user.role === "SUPER_ADMIN") {
          if (active) setContinueTo("/dashboard");
          return;
        }
        const profile = await get<{ careers: unknown[] }>("/users/me");
        if (active)
          setContinueTo(
            profile.careers.length ? "/teacher/dashboard" : "/welcome",
          );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  async function verify() {
    setBusy(true);
    try {
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) throw new Error("Abre el enlace que recibiste por correo.");
      const res = await post<{ message: string }>("/auth/verify-email", {
        token,
      });
      window.history.replaceState(null, "", "/verify-email");
      setHasToken(false);
      setMessage(res.message);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo verificar.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function resend(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const res = await post<{ message: string }>("/auth/resend-verification", {
        email,
      });
      setMessage(res.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo enviar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f1e7] px-6 py-12 text-[#4a1115]">
      <section className="w-full max-w-lg space-y-5 rounded-3xl border border-white bg-white/60 p-7 shadow-xl shadow-[#4a1115]/5 sm:p-10">
        <Link href="/" className="text-sm">
          ← Aura Atlas
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          Verifica tu correo
        </h1>
        <p role="status" className="text-sm leading-7">
          {message}
        </p>
        {hasToken && (
          <button
            disabled={busy}
            onClick={verify}
            className="w-full rounded-xl bg-[#4a1115] p-3 text-white disabled:opacity-50"
          >
            Confirmar mi correo
          </button>
        )}
        <form onSubmit={resend} className="flex flex-col gap-3">
          <label htmlFor="email" className="text-sm">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-xl border border-[#4a1115]/20 bg-white/60 p-3"
          />
          <button
            disabled={busy}
            type="submit"
            className="rounded-xl border border-[#4a1115]/20 p-3 text-sm disabled:opacity-50"
          >
            Reenviar enlace
          </button>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-sm">
          <Link href="/login" className="underline underline-offset-4">
            Ir a iniciar sesión
          </Link>
          {continueTo && (
            <Link href={continueTo} className="font-semibold">
              Continuar a mi espacio →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
