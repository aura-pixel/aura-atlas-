"use client";

import { useEffect, useState } from "react";
import {
  FileUp,
  FileText,
  X,
  Link2,
  Video,
} from "lucide-react";

type Topic = {
  number: string;
  title: string;
};

type Unit = {
  number: number;
  title: string;
  topics: Topic[];
};

type AddContentProps = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  initialStructure?: unknown | null;
  onVideosChange?: (videos: AddedVideo[]) => void;
  onLinksChange?: (links: AddedLink[]) => void;
};

export type AddedVideo = {
  id: string;
  name: string;
  url: string;
  topicNumber: string;
};

export type AddedLink = {
  id: string;
  name: string;
  url: string;
  topicNumber: string;
};

export function AddContent({
  files,
  setFiles,
  initialStructure,
  onVideosChange,
  onLinksChange,
}: AddContentProps) {
  const [activeTab, setActiveTab] = useState<"files" | "videos" | "links">("files");

  const [videoName, setVideoName] = useState("");
const [videoUrl, setVideoUrl] = useState("");
const [videoTopic, setVideoTopic] =
  useState<string>("");

  const [linkName, setLinkName] = useState("");
const [linkUrl, setLinkUrl] = useState("");
const [linkTopic, setLinkTopic] = useState<string>("");

  const [addedVideos, setAddedVideos] = useState<AddedVideo[]>([]);
const [addedLinks, setAddedLinks] = useState<AddedLink[]>([]);
  
  useEffect(() => {
  onVideosChange?.(addedVideos);
}, [addedVideos, onVideosChange]);
useEffect(() => {
  onLinksChange?.(addedLinks);
}, [addedLinks, onLinksChange]);
  const structure =
  initialStructure &&
  typeof initialStructure === "object"
    ? (initialStructure as {
        units?: Unit[];
      })
    : null;

const units = structure?.units ?? [];

  function removeFile(index: number) {
    setFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index),
    );
  }

  function addVideo() {
  if (!videoName.trim() || !videoUrl.trim() || !videoTopic) {
    return;
  }

  const newVideo: AddedVideo = {
    id: crypto.randomUUID(),
    name: videoName.trim(),
    url: videoUrl.trim(),
    topicNumber: videoTopic,
  };

  setAddedVideos((current) => [
    ...current,
    newVideo,
  ]);

  setVideoName("");
  setVideoUrl("");
  setVideoTopic("");
}

function addLink() {
  if (!linkName.trim() || !linkUrl.trim() || !linkTopic) {
    return;
  }

  const newLink: AddedLink = {
    id: crypto.randomUUID(),
    name: linkName.trim(),
    url: linkUrl.trim(),
    topicNumber: linkTopic,
  };

  setAddedLinks((current) => [
    ...current,
    newLink,
  ]);

  setLinkName("");
  setLinkUrl("");
  setLinkTopic("");
}

  return (
    <>
      {/* Selector de pestañas */}
      <div className="mb-6 rounded-[1.5rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-2 shadow-sm">
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("files")}
            className={`
              flex items-center justify-center gap-2
              rounded-xl px-4 py-3
              text-sm font-semibold
              transition-all
              ${
                activeTab === "files"
                  ? "bg-[#4A1115] text-[#FFFDF8] shadow-sm"
                  : "text-[#687584] hover:bg-[#F7F1E7] hover:text-[#4A1115]"
              }
            `}
          >
            <FileUp className="h-4 w-4" />
            Archivos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className={`
              flex items-center justify-center gap-2
              rounded-xl px-4 py-3
              text-sm font-semibold
              transition-all
              ${
                activeTab === "videos"
                  ? "bg-[#4A1115] text-[#FFFDF8] shadow-sm"
                  : "text-[#687584] hover:bg-[#F7F1E7] hover:text-[#4A1115]"
              }
            `}
          >
            <Video className="h-4 w-4" />
            Videos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`
              flex items-center justify-center gap-2
              rounded-xl px-4 py-3
              text-sm font-semibold
              transition-all
              ${
                activeTab === "links"
                  ? "bg-[#4A1115] text-[#FFFDF8] shadow-sm"
                  : "text-[#687584] hover:bg-[#F7F1E7] hover:text-[#4A1115]"
              }
            `}
          >
            <Link2 className="h-4 w-4" />
            Enlaces
          </button>
        </div>
      </div>

      {/* Vista de la pestaña Archivos */}
      {activeTab === "files" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Columna principal de archivos */}
          <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8AFC0]/35 text-[#4A1115]">
                <FileUp className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#211719]">
                  Agrega tus materiales
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#687584]">
                  Puedes seleccionar varios archivos de una sola vez.
                </p>
              </div>
            </div>

            <div className="mt-7">
              <label
                htmlFor="content-files"
                className="
                  group flex cursor-pointer flex-col
                  items-center justify-center
                  rounded-[1.75rem]
                  border border-dashed
                  border-[#4A1115]/20
                  bg-[#F7F1E7]/50
                  px-6 py-12
                  text-center
                  transition-all
                  hover:border-[#4A1115]/40
                  hover:bg-[#E8AFC0]/10
                "
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#FFFDF8] text-[#4A1115] shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">
                  <FileUp className="h-7 w-7" />
                </div>

                <p className="mt-5 font-semibold text-[#211719]">
                  Arrastra tus archivos aquí
                </p>

                <p className="mt-1 text-sm text-[#687584]">
                  o selecciónalos desde tu equipo
                </p>

                <span className="mt-5 rounded-xl bg-[#4A1115] px-5 py-2.5 text-sm font-semibold text-[#FFFDF8] shadow-md shadow-[#4A1115]/15 transition-transform group-hover:-translate-y-0.5">
                  Seleccionar archivos
                </span>

                <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#687584]">
                  PDF · PPTX · DOCX · XLSX · imágenes
                </p>
              </label>

              <input
                id="content-files"
                type="file"
                multiple
                accept=".pdf,.pptx,.ppt,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(event) => {
                  const selectedFiles = Array.from(event.target.files ?? []);

                  setFiles((current) => [...current, ...selectedFiles]);

                  event.target.value = "";
                }}
              />
            </div>

            {/* Archivos seleccionados */}
            {files.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-[#211719]">
                    Material seleccionado
                  </p>

                  <span className="rounded-full bg-[#E8AFC0]/25 px-3 py-1 text-xs font-semibold text-[#4A1115]">
                    {files.length} {files.length === 1 ? "archivo" : "archivos"}
                  </span>
                </div>

                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className="group flex items-center gap-3 rounded-2xl border border-[#4A1115]/10 bg-[#F7F1E7]/45 p-3.5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFFDF8] text-[#4A1115] shadow-sm">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#211719]">
                          {file.name}
                        </p>

                        <p className="mt-0.5 text-xs text-[#687584]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#687584] transition-colors hover:bg-[#4A1115]/5 hover:text-[#4A1115]"
                        aria-label={`Quitar ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Información lateral */}
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-[#4A1115]/10 bg-[#4A1115] p-6 text-[#FFFDF8]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFDF8]/10">
                <FileUp className="h-5 w-5" />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Materiales compatibles
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#FFFDF8]/70">
                Puedes subir documentos, presentaciones, hojas de cálculo e
                imágenes. Aura Atlas analizará su contenido para ayudarte a
                organizarlos.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6">
              <p className="text-sm font-bold text-[#211719]">
                También puedes agregar
              </p>

              <div className="mt-3 space-y-2 text-sm text-[#687584]">
                <p>🎥 Videos mediante enlace</p>
                <p>🔗 Recursos externos mediante URL</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vistas vacías preparadas para los otros tabs */}
      {activeTab === "videos" && (
  <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

    {/* =====================================================
        FORMULARIO DE VIDEO
    ====================================================== */}

    <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6 shadow-sm sm:p-8">

      <div className="flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8AFC0]/35 text-[#4A1115]">
          <Video className="h-6 w-6" />
        </div>

        <div>

          <h3 className="text-xl font-bold text-[#211719]">
            Agrega un video
          </h3>

          <p className="mt-1 text-sm leading-6 text-[#687584]">
            Comparte un video de YouTube, Vimeo u otra
            plataforma.
          </p>

        </div>

      </div>


      <div className="mt-7 space-y-5">

        {/* Nombre */}

        <div>

          <label
            htmlFor="video-name"
            className="text-sm font-semibold text-[#211719]"
          >
            Nombre del video
          </label>

          <input
            id="video-name"
            type="text"
            value={videoName}
            onChange={(event) =>
              setVideoName(event.target.value)
            }
            placeholder="Ej. Introducción a la salud mental"
            className="mt-2 h-12 w-full rounded-xl border border-[#4A1115]/10 bg-[#F7F1E7]/40 px-4 text-sm text-[#211719] outline-none transition focus:border-[#4A1115]/30 focus:bg-[#FFFDF8]"
          />

        </div>


        {/* URL */}

        <div>

          <label
            htmlFor="video-url"
            className="text-sm font-semibold text-[#211719]"
          >
            Enlace del video
          </label>

          <input
            id="video-url"
            type="url"
            value={videoUrl}
            onChange={(event) =>
              setVideoUrl(event.target.value)
            }
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-2 h-12 w-full rounded-xl border border-[#4A1115]/10 bg-[#F7F1E7]/40 px-4 text-sm text-[#211719] outline-none transition focus:border-[#4A1115]/30 focus:bg-[#FFFDF8]"
          />

        </div>


        {/* Tema */}

        <div>

          <label
            htmlFor="video-topic"
            className="text-sm font-semibold text-[#211719]"
          >
            ¿A qué tema pertenece?
          </label>

          <select
            id="video-topic"
            value={videoTopic}
            onChange={(event) =>
              setVideoTopic(event.target.value)
            }
            className="mt-2 h-12 w-full rounded-xl border border-[#4A1115]/10 bg-[#F7F1E7]/40 px-4 text-sm text-[#211719] outline-none transition focus:border-[#4A1115]/30 focus:bg-[#FFFDF8]"
          >

            <option value="">
              Selecciona un tema
            </option>

            {units.map((unit) => (
              <optgroup
                key={unit.number}
                label={`Unidad ${unit.number} · ${unit.title}`}
              >

                {unit.topics?.map((topic) => (
                  <option
                    key={topic.number}
                    value={topic.number}
                  >
                    {topic.number} · {topic.title}
                  </option>
                ))}

              </optgroup>
            ))}

          </select>

        </div>


        {/* Botón */}

        <button
  type="button"
  onClick={addVideo}
  disabled={
    !videoName.trim() ||
    !videoUrl.trim() ||
    !videoTopic
  }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4A1115] px-5 text-sm font-semibold text-[#FFFDF8] shadow-md shadow-[#4A1115]/15 transition hover:bg-[#5D171D] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Video className="h-4 w-4" />

          Agregar video
        </button>

      </div>

      {addedVideos.length > 0 && (
  <div className="mt-8 border-t border-[#4A1115]/10 pt-7">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm font-bold text-[#211719]">
        Videos agregados
      </p>

      <span className="rounded-full bg-[#E8AFC0]/25 px-3 py-1 text-xs font-semibold text-[#4A1115]">
        {addedVideos.length}{" "}
        {addedVideos.length === 1 ? "video" : "videos"}
      </span>
    </div>

    <div className="space-y-2">
      {addedVideos.map((video) => (
        <div
          key={video.id}
          className="flex items-center gap-3 rounded-2xl border border-[#4A1115]/10 bg-[#F7F1E7]/45 p-3.5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFFDF8] text-[#4A1115] shadow-sm">
            <Video className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#211719]">
              {video.name}
            </p>

            <p className="mt-0.5 truncate text-xs text-[#687584]">
              {video.url}
            </p>
          </div>

          <button
            type="button"
           onClick={() =>
  setAddedVideos((current) =>
    current.filter((item) => item.id !== video.id),
  )
}

            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#687584] transition-colors hover:bg-[#4A1115]/5 hover:text-[#4A1115]"
            aria-label={`Quitar ${video.name}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
)}

    </div>


    {/* =====================================================
        INFORMACIÓN LATERAL
    ====================================================== */}

    <div className="space-y-4">

      <div className="rounded-[1.75rem] border border-[#4A1115]/10 bg-[#4A1115] p-6 text-[#FFFDF8]">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFDF8]/10">
          <Video className="h-5 w-5" />
        </div>

        <h3 className="mt-5 text-lg font-bold">
          Videos por enlace
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#FFFDF8]/70">
          Los videos no se almacenan en Aura Atlas.
          Solo guardamos el enlace que compartas.
        </p>

      </div>


      <div className="rounded-[1.75rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6">

        <p className="text-sm font-bold text-[#211719]">
          Plataformas compatibles
        </p>

        <div className="mt-3 space-y-2 text-sm text-[#687584]">

          <p>• YouTube</p>
          <p>• Vimeo</p>
          <p>• Otras plataformas con enlace público</p>

        </div>

      </div>

    </div>

  </div>
)}

      {activeTab === "links" && (
  <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
    {/* =====================================================
        FORMULARIO DE ENLACES
    ====================================================== */}
    <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8AFC0]/35 text-[#4A1115]">
          <Link2 className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#211719]">
            Agrega un enlace
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#687584]">
            Comparte una página web, artículo o recurso externo.
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-5">
        {/* Nombre */}
        <div>
          <label
            htmlFor="link-name"
            className="text-sm font-semibold text-[#211719]"
          >
            Nombre del enlace
          </label>
          <input
            id="link-name"
            type="text"
            value={linkName}
            onChange={(event) => setLinkName(event.target.value)}
            placeholder="Ej. Guía de práctica clínica"
            className="mt-2 h-12 w-full rounded-xl border border-[#4A1115]/10 bg-[#F7F1E7]/40 px-4 text-sm text-[#211719] outline-none transition focus:border-[#4A1115]/30 focus:bg-[#FFFDF8]"
          />
        </div>

        {/* URL */}
        <div>
          <label
            htmlFor="link-url"
            className="text-sm font-semibold text-[#211719]"
          >
            Enlace
          </label>
          <input
            id="link-url"
            type="url"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="https://..."
            className="mt-2 h-12 w-full rounded-xl border border-[#4A1115]/10 bg-[#F7F1E7]/40 px-4 text-sm text-[#211719] outline-none transition focus:border-[#4A1115]/30 focus:bg-[#FFFDF8]"
          />
        </div>

        {/* Tema */}
        <div>
          <label
            htmlFor="link-topic"
            className="text-sm font-semibold text-[#211719]"
          >
            ¿A qué tema pertenece?
          </label>
          <select
            id="link-topic"
            value={linkTopic}
            onChange={(event) => setLinkTopic(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-[#4A1115]/10 bg-[#F7F1E7]/40 px-4 text-sm text-[#211719] outline-none transition focus:border-[#4A1115]/30 focus:bg-[#FFFDF8]"
          >
            <option value="">Selecciona un tema</option>
            {units.map((unit) => (
              <optgroup
                key={unit.number}
                label={`Unidad ${unit.number} · ${unit.title}`}
              >
                {unit.topics?.map((topic) => (
                  <option key={topic.number} value={topic.number}>
                    {topic.number} · {topic.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Botón */}
        <button
          type="button"
          onClick={addLink}
          disabled={!linkName.trim() || !linkUrl.trim() || !linkTopic}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4A1115] px-5 text-sm font-semibold text-[#FFFDF8] shadow-md shadow-[#4A1115]/15 transition hover:bg-[#5D171D] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Link2 className="h-4 w-4" />
          Agregar enlace
        </button>
      </div>

      {/* Lista de Enlaces Agregados */}
      {addedLinks.length > 0 && (
        <div className="mt-8 border-t border-[#4A1115]/10 pt-7">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-[#211719]">
              Enlaces agregados
            </p>
            <span className="rounded-full bg-[#E8AFC0]/25 px-3 py-1 text-xs font-semibold text-[#4A1115]">
              {addedLinks.length}{" "}
              {addedLinks.length === 1 ? "enlace" : "enlaces"}
            </span>
          </div>

          <div className="space-y-2">
            {addedLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 rounded-2xl border border-[#4A1115]/10 bg-[#F7F1E7]/45 p-3.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFFDF8] text-[#4A1115] shadow-sm">
                  <Link2 className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#211719]">
                    {link.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#687584]">
                    {link.url}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAddedLinks((current) =>
                      current.filter((item) => item.id !== link.id)
                    )
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#687584] transition-colors hover:bg-[#4A1115]/5 hover:text-[#4A1115]"
                  aria-label={`Quitar ${link.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* =====================================================
        INFORMACIÓN LATERAL (SIDEBAR)
    ====================================================== */}
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border border-[#4A1115]/10 bg-[#4A1115] p-6 text-[#FFFDF8]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFDF8]/10">
          <Link2 className="h-5 w-5" />
        </div>
        <h3 className="mt-5 text-lg font-bold">Enlaces externos</h3>
        <p className="mt-2 text-sm leading-6 text-[#FFFDF8]/70">
          Los enlaces se conservan como referencias externas. Aura Atlas no
          almacena ni modifica el contenido de estas páginas.
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6">
        <p className="text-sm font-bold text-[#211719]">Puedes compartir</p>
        <div className="mt-3 space-y-2 text-sm text-[#687584]">
          <p>• Artículos académicos</p>
          <p>• Guías y documentos externos</p>
          <p>• Sitios web</p>
          <p>• Recursos educativos</p>
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
}