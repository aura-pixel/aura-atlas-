"use client";

import { useEffect, useRef, useState } from "react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
  TextLayer,
} from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Minus,
  Plus,
  RotateCw,
} from "lucide-react";
import styles from "./pdf-material.module.css";
import pdfPackage from "pdfjs-dist/package.json";

function loadPdfLibrary(): Promise<typeof import("pdfjs-dist")> {
  const url = `/pdfjs/${pdfPackage.version}/pdf.min.mjs`;
  return import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url);
}

export function PdfMaterial({ url, name }: { url: string; name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(1, Math.floor(entry.contentRect.width - 24))),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let disposed = false;
    let loading: PDFDocumentLoadingTask | undefined;
    setPdf(null);
    setPage(1);
    setZoom(1);
    setError("");
    async function load() {
      const library = await loadPdfLibrary();
      if (disposed) return;
      const assets = `/pdfjs/${library.version}/`;
      library.GlobalWorkerOptions.workerSrc = `${assets}pdf.worker.min.mjs`;
      loading = library.getDocument({
        url,
        withCredentials:
          new URL(url, window.location.href).origin === window.location.origin,
        cMapUrl: `${assets}cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `${assets}standard_fonts/`,
        wasmUrl: `${assets}wasm/`,
        iccUrl: `${assets}iccs/`,
        isEvalSupported: false,
      });
      const document = await loading.promise;
      if (!disposed) setPdf(document);
    }
    void load().catch((reason: { name?: string }) => {
      if (disposed) return;
      setError(
        reason.name === "PasswordException"
          ? "Este PDF requiere una contraseña. Puedes abrir el original para consultarlo."
          : "No pudimos cargar el PDF. Reintenta o abre el archivo original.",
      );
    });
    return () => {
      disposed = true;
      void loading?.destroy().catch(() => undefined);
    };
  }, [url, attempt]);

  return (
    <div
      ref={root}
      className={styles.pdf}
      aria-label={`Documento PDF: ${name}`}
    >
      <div className={styles.toolbar}>
        <div className={styles.group}>
          <button
            type="button"
            aria-label="Página anterior"
            disabled={!pdf || page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            <ChevronLeft size={19} />
          </button>
          <label>
            Página{" "}
            <input
              aria-label="Número de página"
              type="number"
              inputMode="numeric"
              min={1}
              max={pdf?.numPages ?? 1}
              value={page}
              disabled={!pdf}
              onChange={(event) => {
                const value = event.target.valueAsNumber;
                if (Number.isFinite(value))
                  setPage(Math.min(pdf?.numPages ?? 1, Math.max(1, value)));
              }}
            />{" "}
            de {pdf?.numPages ?? "…"}
          </label>
          <button
            type="button"
            aria-label="Página siguiente"
            disabled={!pdf || page >= pdf.numPages}
            onClick={() => setPage((current) => current + 1)}
          >
            <ChevronRight size={19} />
          </button>
        </div>
        <div className={styles.group}>
          <button
            type="button"
            aria-label="Alejar PDF"
            disabled={!pdf || zoom <= 0.75}
            onClick={() => setZoom((current) => Math.max(0.75, current - 0.25))}
          >
            <Minus size={17} />
          </button>
          <button
            type="button"
            disabled={!pdf}
            onClick={() => setZoom(1)}
            aria-label="Ajustar PDF al ancho"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            aria-label="Acercar PDF"
            disabled={!pdf || zoom >= 2.5}
            onClick={() => setZoom((current) => Math.min(2.5, current + 0.25))}
          >
            <Plus size={17} />
          </button>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir PDF original en otra pestaña"
        >
          <ExternalLink size={16} />
          <span>Original</span>
        </a>
      </div>
      {error ? (
        <div className={styles.message} role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setAttempt((current) => current + 1)}
          >
            <RotateCw size={16} /> Reintentar
          </button>
        </div>
      ) : pdf && width ? (
        <PdfPage
          key={`${url}-${attempt}`}
          document={pdf}
          number={page}
          width={width * zoom}
        />
      ) : (
        <p className={styles.message} role="status">
          Cargando PDF…
        </p>
      )}
    </div>
  );
}

function PdfPage({
  document: pdf,
  number,
  width,
}: {
  document: PDFDocumentProxy;
  number: number;
  width: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let disposed = false;
    let render: RenderTask | undefined;
    let text: TextLayer | undefined;
    setLoading(true);
    setError(false);
    async function paint() {
      const page = await pdf.getPage(number);
      if (disposed || !stage.current) return;
      const viewport = page.getViewport({
        scale: width / page.getViewport({ scale: 1 }).width,
      });
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        2,
        Math.sqrt(4_000_000 / (viewport.width * viewport.height)),
      );
      const canvas = window.document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width * ratio));
      canvas.height = Math.max(1, Math.floor(viewport.height * ratio));
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.setAttribute("aria-hidden", "true");
      const layer = window.document.createElement("div");
      layer.className = styles.textLayer;
      layer.style.setProperty("--total-scale-factor", String(viewport.scale));
      stage.current.style.width = `${viewport.width}px`;
      stage.current.style.height = `${viewport.height}px`;
      stage.current.replaceChildren(canvas, layer);
      render = page.render({
        canvas,
        viewport,
        transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
      });
      await render.promise;
      const library = await loadPdfLibrary();
      const content = await page.getTextContent();
      if (disposed) return;
      text = new library.TextLayer({
        textContentSource: content,
        container: layer,
        viewport,
      });
      await text.render();
      if (!disposed) setLoading(false);
    }
    void paint().catch(() => {
      if (!disposed) {
        setError(true);
        setLoading(false);
      }
    });
    return () => {
      disposed = true;
      render?.cancel();
      text?.cancel();
    };
  }, [pdf, number, width]);
  useEffect(() => {
    scroll.current?.scrollTo({ top: 0, left: 0 });
  }, [number]);
  return (
    <div className={styles.pageArea}>
      {loading && (
        <p role="status" className={styles.renderStatus}>
          Preparando página {number}…
        </p>
      )}
      {error && (
        <p role="alert" className={styles.message}>
          No pudimos mostrar esta página. Prueba otra página o abre el PDF
          original.
        </p>
      )}
      <div
        ref={scroll}
        className={styles.scroll}
        aria-label={`Página ${number} del PDF`}
        tabIndex={0}
      >
        <div ref={stage} className={styles.sheet} />
      </div>
    </div>
  );
}
