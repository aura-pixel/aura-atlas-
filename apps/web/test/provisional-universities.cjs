const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict"),
  fs = require("node:fs");
(async () => {
  const fixture = JSON.parse(
    fs.readFileSync("../api/.temp/provisional-browser-fixture.json", "utf8"),
  );
  const b = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const errors = [];
    const teacher = await b.newContext();
    const admin = await b.newContext();
    for (const [context, email] of [
      [teacher, fixture.teacher],
      [admin, fixture.admin],
    ]) {
      const boot = await context.newPage();
      await boot.goto("http://localhost:3001/login", {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      const login = await context.request.post(
        "http://localhost:3001/api/backend/auth/login",
        {
          headers: { Origin: "http://localhost:3001" },
          data: { email, password: fixture.password },
          timeout: 90000,
        },
      );
      assert.equal(login.status(), 201);
    }
    const p = teacher.pages()[0];
    p.setDefaultNavigationTimeout(90000);
    p.on("pageerror", (e) => errors.push(e.message));
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.goto("http://localhost:3001/login", {
      waitUntil: "domcontentloaded",
    });
    await p.goto("http://localhost:3001/teacher", {
      waitUntil: "domcontentloaded",
    });
    await p
      .getByRole("heading", { name: "Selecciona tu universidad" })
      .waitFor();
    await p
      .getByRole("button", { name: /Universidad del Conocimiento/ })
      .waitFor();
    await p.getByRole("searchbox", { name: "Buscar universidad" }).fill("UDC");
    await p
      .getByRole("button", { name: /Universidad del Conocimiento/ })
      .waitFor();
    await p.screenshot({
      path: ".temp/onboarding-desktop.png",
      fullPage: true,
    });
    await p
      .getByRole("button", { name: /Universidad del Conocimiento/ })
      .click();
    await p.getByRole("heading", { name: "Ahora, tu facultad" }).waitFor();
    await p.getByRole("button", { name: "Atras", exact: true }).count();
    await p.getByRole("button", { name: /Atr/ }).click();
    await p
      .getByRole("heading", { name: "Selecciona tu universidad" })
      .waitFor();
    console.log("PASS catalog search, selecting university and going back");
    await p
      .getByRole("button", { name: "Añadir universidad", exact: true })
      .click();
    await p.getByRole("dialog").waitFor();
    await p.screenshot({
      path: ".temp/university-modal-desktop.png",
      fullPage: true,
    });
    await p.getByRole("button", { name: "Crear mi espacio privado" }).click();
    await p.getByRole("alert").waitFor();
    assert(await p.getByRole("dialog").isVisible());
    console.log("PASS modal validation keeps invalid names out");
    await p
      .getByLabel("Nombre oficial de la universidad")
      .fill("Universidad Nueva del Valle");
    await p.getByLabel("Siglas", { exact: true }).fill("UNV");
    await p.getByLabel("Facultad o escuela").fill("Facultad de Medicina");
    await p
      .getByLabel("Carrera", { exact: true })
      .fill("Licenciatura en Terapia Ocupacional");
    await p.getByRole("checkbox").check();
    await p.getByRole("button", { name: "Crear mi espacio privado" }).click();
    await p.waitForURL("**/teacher/dashboard");
    await p.getByRole("link", { name: "Ver mis solicitudes" }).waitFor();
    await p.getByRole("link", { name: "Ver mis solicitudes" }).click();
    await p
      .getByRole("heading", { name: "Universidad Nueva del Valle" })
      .waitFor();
    assert(
      await p.getByText("En revisión · Privada", { exact: true }).isVisible(),
    );
    console.log(
      "PASS creation enrolls teacher immediately and remains private",
    );
    const ap = admin.pages()[0];
    ap.setDefaultNavigationTimeout(90000);
    ap.on("pageerror", (e) => errors.push(e.message));
    await ap.goto("http://localhost:3001/login", {
      waitUntil: "domcontentloaded",
    });
    await ap.goto("http://localhost:3001/dashboard/requests", {
      waitUntil: "domcontentloaded",
    });
    const row = ap
      .locator("article")
      .filter({
        has: ap.getByRole("heading", { name: /Universidad Nueva del Valle/ }),
      });
    await row.getByRole("button", { name: "Revisar solicitud" }).click();
    await ap
      .getByLabel("Observaciones (obligatorias si solicitas correcciones)")
      .fill("Revisa el nombre oficial antes de aprobar.");
    await ap.getByRole("button", { name: "Solicitar correcciones" }).click();
    await ap.getByRole("dialog").waitFor({ state: "hidden" });
    await p.reload({ waitUntil: "domcontentloaded" });
    await p
      .getByText("Requiere correcciones · Privada", { exact: true })
      .waitFor();
    await p.getByRole("button", { name: "Corregir y reenviar" }).click();
    await p
      .getByLabel("Nombre oficial de la universidad")
      .fill("Universidad Nueva del Valle de Mexico");
    await p.getByRole("checkbox").check();
    await p.getByRole("button", { name: "Reenviar a revisión" }).click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    await p
      .getByRole("heading", { name: "Universidad Nueva del Valle de Mexico" })
      .waitFor();
    console.log(
      "PASS administrator requests corrections and teacher resubmits",
    );
    await ap.reload({ waitUntil: "domcontentloaded" });
    await ap
      .locator("article")
      .filter({
        has: ap.getByRole("heading", {
          name: /Universidad Nueva del Valle de Mexico/,
        }),
      })
      .getByRole("button", { name: "Revisar solicitud" })
      .click();
    await ap
      .getByRole("button", { name: "Aprobar y añadir al catálogo" })
      .click();
    await ap.getByRole("dialog").waitFor({ state: "hidden" });
    await p.reload({ waitUntil: "domcontentloaded" });
    await p
      .getByText("Aprobada · Disponible para todos", { exact: true })
      .waitFor();
    const publicData = await (
      await b.newContext()
    ).request.get("http://localhost:3001/api/backend/universities");
    assert(
      (await publicData.json()).some(
        (u) => u.name === "Universidad Nueva del Valle de Mexico",
      ),
    );
    console.log("PASS approval is visible to owner and public catalog");
    await p.setViewportSize({ width: 390, height: 844 });
    await p.goto("http://localhost:3001/teacher", {
      waitUntil: "domcontentloaded",
    });
    await p
      .getByRole("button", { name: /Universidad del Conocimiento/ })
      .waitFor();
    await p.getByRole("searchbox", { name: "Buscar universidad" }).fill("UDC");
    await p.screenshot({ path: ".temp/onboarding-mobile.png", fullPage: true });
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p
      .getByRole("button", { name: "Añadir universidad", exact: true })
      .click();
    await p.getByRole("dialog").waitFor();
    await p.screenshot({
      path: ".temp/university-modal-mobile.png",
      fullPage: true,
    });
    assert(await p.getByLabel("Nombre oficial de la universidad").isVisible());
    console.log("PASS mobile layout and modal");
    assert.deepEqual(errors, []);
    console.log("PASS no browser exceptions");
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
