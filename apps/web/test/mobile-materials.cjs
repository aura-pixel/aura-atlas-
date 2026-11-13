const { chromium, webkit, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const PDFDocument = require("pdfkit");
const fixtures = path.resolve(".temp/mobile-fixtures");
fs.mkdirSync(fixtures, { recursive: true });
async function pdfBuffer() {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const ready = new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(chunks))),
  );
  doc.fontSize(22).text("Mobile PDF page one");
  doc.fontSize(13).text("Reading materials in Aura Atlas.");
  doc.addPage().fontSize(22).text("Mobile PDF page two");
  doc.end();
  return ready;
}
function wavBuffer() {
  const samples = 22050;
  const data = Buffer.alloc(44 + samples * 2);
  data.write("RIFF");
  data.writeUInt32LE(data.length - 8, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(22050, 24);
  data.writeUInt32LE(44100, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++)
    data.writeInt16LE(
      Math.round(Math.sin((i / 22050) * 440 * 2 * Math.PI) * 1000),
      44 + i * 2,
    );
  return data;
}
(async () => {
  const pdf = await pdfBuffer();
  const audio = wavBuffer();
  const image = fs.readFileSync("public/aura-atlas.png");
  let video;
  const videoPath = path.join(fixtures, "video.mp4");
  if (fs.existsSync(videoPath)) video = fs.readFileSync(videoPath);
  else {
    const response = await fetch(
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    );
    if (!response.ok) throw Error("MDN CC0 video fixture unavailable");
    video = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(videoPath, video);
  }
  const publicFixtures = path.resolve("public/.temp/mobile-fixtures");
  fs.mkdirSync(publicFixtures, { recursive: true });
  fs.writeFileSync(path.join(publicFixtures, "video.mp4"), video);
  fs.writeFileSync(path.join(publicFixtures, "audio.wav"), audio);
  fs.writeFileSync(path.join(publicFixtures, "image.png"), image);
  const materials = [
    {
      id: "pdf",
      name: "PDF de lectura",
      type: "PDF",
      mimeType: "application/pdf",
    },
    { id: "video", name: "Video MP4", type: "VIDEO", mimeType: "video/mp4" },
    {
      id: "audio",
      name: "Audio de apoyo",
      type: "AUDIO",
      mimeType: "audio/wav",
    },
    {
      id: "image",
      name: "Imagen de apoyo",
      type: "IMAGE",
      mimeType: "image/png",
    },
    {
      id: "broken",
      name: "Archivo no disponible",
      type: "PDF",
      mimeType: "application/pdf",
    },
    {
      id: "youtube",
      name: "Video de YouTube",
      type: "VIDEO",
      url: "https://m.youtube.com/shorts/abcdefghijk",
    },
    {
      id: "document",
      name: "Documento Word",
      type: "DOCUMENT",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    { id: "presentation", name: "Presentación", type: "PRESENTATION" },
    {
      id: "link",
      name: "Enlace externo",
      type: "LINK",
      url: "https://example.org/lectura",
    },
  ].map((item) => ({
    ...item,
    url:
      item.url ||
      ({
        video: "http://localhost:3001/.temp/mobile-fixtures/video.mp4",
        audio: "http://localhost:3001/.temp/mobile-fixtures/audio.wav",
        image: "http://localhost:3001/.temp/mobile-fixtures/image.png",
      }[item.id] ??
        "users/fixture/" + item.id),
  }));
  const data = {
    id: "mobile",
    title: "Aprender y conectar",
    primaryColor: "#4A1115",
    secondaryColor: "#CADABD",
    fontFamily: "Alegreya",
    theme: "LIGHT",
    user: { name: "Docente" },
    subject: {
      name: "Aprender y conectar",
      career: {
        name: "Educación",
        faculty: {
          name: "Humanidades",
          university: { name: "Universidad de prueba", abbreviation: "UDC" },
        },
      },
    },
    units: [
      {
        id: "unit1",
        number: 1,
        title: "Fundamentos del aprendizaje",
        topics: [
          {
            id: "topic1",
            number: "1.1",
            title: "Materiales de apoyo",
            materials,
          },
        ],
      },
    ],
  };
  const fileMap = {
    pdf: { body: pdf, type: "application/pdf" },
    video: { body: video, type: "video/mp4" },
    audio: { body: audio, type: "audio/wav" },
    image: { body: image, type: "image/png" },
  };
  const engines = process.argv.includes("--webkit")
    ? [["webkit", webkit]]
    : [["chromium", chromium]];
  for (const [name, engine] of engines) {
    const browser = await engine.launch(
      name === "chromium"
        ? { channel: "msedge", headless: true }
        : { headless: true },
    );
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/hypertexts/public/mobile-materials", (route) =>
      route.fulfill({ json: data }),
    );
    await page.route("https://www.youtube.com/embed/*", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<p>Video provider fixture</p>",
      }),
    );
    await page.route("**/materials/file/*", async (route) => {
      const id = route.request().url().split("/").pop();
      const file = fileMap[id];
      if (!file) {
        await route.fulfill({ status: 404, json: { message: "Not found" } });
        return;
      }
      let body = file.body,
        status = 200,
        headers = { "content-type": file.type, "accept-ranges": "bytes" };
      const range = route.request().headers()["range"];
      if (range) {
        const match = /bytes=(\d+)-(\d*)/.exec(range);
        if (match) {
          const start = Number(match[1]),
            end = match[2]
              ? Math.min(body.length - 1, Number(match[2]))
              : body.length - 1;
          headers["content-range"] = `bytes ${start}-${end}/${body.length}`;
          body = body.subarray(start, end + 1);
          status = 206;
        }
      }
      headers["content-length"] = String(body.length);
      await route.fulfill({ status, headers, body });
    });
    await page.goto("http://localhost:3001/preview/atlas/mobile-materials", {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
    await page
      .getByRole("button", { name: "Explorar el recorrido", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Abrir unidad 1: Fundamentos del aprendizaje",
        exact: true,
      })
      .click();
    const resources = page.getByRole("region", {
      name: "Recursos del tema",
      exact: true,
    });
    await resources
      .getByRole("button", { name: "PDF de lectura", exact: true })
      .click();
    await expect(
      page.getByText("Mobile PDF page one", { exact: true }),
    ).toBeAttached({ timeout: 60000 });
    await expect(page.locator("canvas").first()).toBeVisible();
    expect(
      await page
        .locator("canvas")
        .first()
        .evaluate((canvas) => {
          const pixels = canvas
            .getContext("2d")
            .getImageData(0, 0, canvas.width, canvas.height).data;
          let ink = 0;
          for (let i = 0; i < pixels.length; i += 4)
            if (
              pixels[i + 3] === 255 &&
              pixels[i] < 150 &&
              pixels[i + 1] < 150 &&
              pixels[i + 2] < 150
            )
              ink++;
          return ink > 20;
        }),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Página siguiente", exact: true })
      .click();
    await expect(
      page.getByText("Mobile PDF page two", { exact: true }),
    ).toBeAttached();
    await page
      .getByRole("button", { name: "Acercar PDF", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Ajustar PDF al ancho" }),
    ).toHaveText("125%");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    // Exercise the fullscreen fallback used by mobile browsers without the Fullscreen API.
    await page.evaluate(() =>
      Object.defineProperty(document, "fullscreenEnabled", {
        configurable: true,
        value: false,
      }),
    );
    await page
      .getByRole("button", { name: "Ampliar recurso", exact: true })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Visor del recurso", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Mobile PDF page two", { exact: true }),
    ).toBeAttached();
    await page
      .getByRole("button", { name: "Reducir recurso", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Visor del recurso", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("spinbutton", { name: "Número de página" }),
    ).toHaveValue("2");
    await page.getByRole("button", { name: "Ajustar PDF al ancho" }).click();
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await expect(
        page.getByText("Mobile PDF page two", { exact: true }),
      ).toBeAttached();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 844, height: 390 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `.temp/mobile-pdf-${name}.png`,
      fullPage: true,
    });
    await resources
      .getByRole("button", { name: "Video MP4", exact: true })
      .click();
    const movie = page.locator("video");
    await movie.evaluate((element) => {
      element.muted = true;
      element.play().catch(() => undefined);
    });
    await expect
      .poll(() => movie.evaluate((element) => element.readyState), {
        timeout: 15000,
      })
      .toBeGreaterThanOrEqual(1);
    await movie.evaluate(async (element) => {
      element.muted = true;
      await element.play();
    });
    await expect
      .poll(() => movie.evaluate((element) => element.currentTime))
      .toBeGreaterThan(0);
    await movie.evaluate((element) => element.pause());
    await expect(movie).toHaveAttribute("playsinline", "");
    await resources
      .getByRole("button", { name: "Audio de apoyo", exact: true })
      .click();
    const sound = page.locator("audio");
    await expect
      .poll(() => sound.evaluate((element) => element.readyState))
      .toBeGreaterThanOrEqual(1);
    await sound.evaluate(async (element) => {
      element.muted = true;
      await element.play();
    });
    await expect
      .poll(() => sound.evaluate((element) => element.currentTime))
      .toBeGreaterThan(0);
    await resources
      .getByRole("button", { name: "Imagen de apoyo", exact: true })
      .click();
    await expect
      .poll(() =>
        page
          .getByAltText("Imagen de apoyo", { exact: true })
          .evaluate((element) => element.naturalWidth),
      )
      .toBeGreaterThan(0);
    await resources
      .getByRole("button", { name: "Video de YouTube", exact: true })
      .click();
    await expect(
      page.locator('iframe[title="Video de YouTube"]'),
    ).toHaveAttribute("src", "https://www.youtube.com/embed/abcdefghijk");
    await resources
      .getByRole("button", { name: "Documento Word", exact: true })
      .click();
    await expect(
      page.getByRole("link", { name: "Abrir documento", exact: true }),
    ).toHaveAttribute("target", "_blank");
    await resources
      .getByRole("button", { name: "Presentación", exact: true })
      .click();
    await expect(
      page.getByRole("link", { name: "Abrir presentación", exact: true }),
    ).toHaveAttribute("target", "_blank");
    await expect(
      resources.getByRole("link", {
        name: "Enlace externo (abre en otra pestaña)",
        exact: true,
      }),
    ).toHaveAttribute("rel", "noopener noreferrer");
    await resources
      .getByRole("button", { name: "Archivo no disponible", exact: true })
      .click();
    await expect(
      page
        .getByRole("region", { name: "Visor del recurso", exact: true })
        .getByRole("alert"),
    ).toContainText("No pudimos cargar el PDF");
    await expect(
      page.getByRole("link", { name: "Abrir PDF original en otra pestaña" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reintentar", exact: true }),
    ).toBeVisible();
    if (errors.length) throw Error(errors.join("\n"));
    console.log(
      `PASS ${name}: mobile PDF pixels/text/pages/zoom/rotation, fullscreen fallback without losing page, MP4 and audio playback, images, provider video, external links/documents, missing PDF fallback, no overflow`,
    );
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
