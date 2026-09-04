import { ContentMatcher } from "../src/academic-structure/classifiers/content-matcher";

const matcher = new ContentMatcher();

const topics = [
  { number: "1.1", title: "Determinantes sociales de la salud" },
  { number: "1.2", title: "Promoción de la salud" },
  { number: "1.3", title: "Prevención de enfermedades" },
  { number: "2.1", title: "Aspectos clínicos de la salud mental" },
  { number: "2.2", title: "Factores sociales que influyen en la salud mental" },
  { number: "2.3", title: "Evaluación de la salud mental" },
  { number: "3.1", title: "Proceso de evaluación ocupacional" },
  { number: "3.2", title: "Intervención en terapia ocupacional" },
  { number: "3.3", title: "Planificación del tratamiento" },
];

const testFiles = [
  {
    name: "1.1 determinantes sociales.pdf",
    text: `
      Los determinantes sociales de la salud
      corresponden a las condiciones sociales
      en las que las personas nacen, viven,
      trabajan y se desarrollan.
    `,
  },
  {
    name: "2.2 factores sociales.pptx",
    text: `
      Los factores sociales influyen directamente
      en la salud mental. Se consideran factores
      familiares, económicos, culturales y sociales.
    `,
  },
  {
    name: "clase salud mental.pdf",
    text: `
      En esta sesión se revisarán los aspectos
      clínicos de la salud mental y los principales
      factores sociales que influyen en ella.
    `,
  },
  {
    name: "promocion salud.mp4",
    text: `
      La promoción de la salud busca fortalecer
      las capacidades de las personas y comunidades
      para mejorar su salud.
    `,
  },
  {
    name: "evaluacion.pdf",
    text: `
      La evaluación de la salud mental permite
      identificar características clínicas,
      necesidades y condiciones relevantes
      para la intervención.
    `,
  },
  {
    name: "intervencion terapia ocupacional.pdf",
    text: `
      La intervención en terapia ocupacional
      comprende la planificación y aplicación
      de estrategias dirigidas a las necesidades
      ocupacionales de la persona.
    `,
  },
  {
    name: "plan tratamiento.docx",
    text: `
      El plan de tratamiento establece los objetivos,
      estrategias y actividades que serán desarrolladas
      durante el proceso de intervención.
    `,
  },
  {
    name: "clase 04.pdf",
    text: `
      En esta sesión se estudian los factores sociales
      que influyen en la salud mental y su relación
      con el contexto familiar y comunitario.
    `,
  },
  {
    name: "salud mental aspectos clinicos.pdf",
    text: `
      Los aspectos clínicos de la salud mental
      incluyen la identificación de signos,
      síntomas y características clínicas relevantes.
    `,
  },
  {
    name: "prevencion.pdf",
    text: `
      La prevención de enfermedades comprende
      acciones destinadas a reducir factores de riesgo
      y evitar la aparición de enfermedades.
    `,
  },
];

for (const file of testFiles) {
  console.log("\n======================================");
  console.log(`📄 ${file.name}`);
  console.log("======================================");

  // matcher.match devuelve UN objeto de resultado para este archivo
  const result = matcher.match(file.name, file.text, topics);

  console.log(`🎯 Confianza: ${result.confidence}`);
  console.log(
    `📏 Diferencia con segundo candidato: ${(result.margin * 100).toFixed(1)}%`
  );

  if (result.suggestedTopic) {
    console.log(
      `👉 Sugerencia: ${result.suggestedTopic.number} — ${result.suggestedTopic.title}`
    );
  } else {
    console.log("❓ No se pudo determinar automáticamente.");
  }

  console.log("\nTop 3 Candidatos:");

  // Iteramos sobre el top 3 de candidatos de este resultado
  const topCandidates = (result.candidates || []).slice(0, 3);

  for (const candidate of topCandidates) {
    console.log(`\n  📌 ${candidate.number} — ${candidate.title}`);
    console.log(`     Score: ${(candidate.score * 100).toFixed(1)}%`);
    console.log(
      `     Número: ${candidate.signals?.numberMatch ? "✓" : "—"}`
    );
    console.log(
      `     Nombre: ${((candidate.signals?.titleScore || 0) * 100).toFixed(1)}%`
    );
    console.log(
      `     Contenido: ${((candidate.signals?.contentScore || 0) * 100).toFixed(1)}%`
    );
  }
}