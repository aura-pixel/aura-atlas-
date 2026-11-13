const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

(async () => {
  const fixture = JSON.parse(
    fs.readFileSync("../api/.temp/provisional-browser-fixture.json", "utf8"),
  );
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const teacher = await browser.newContext();
    const admin = await browser.newContext();
    for (const [context, email] of [
      [teacher, fixture.teacher],
      [admin, fixture.admin],
    ]) {
      const boot = await context.newPage();
      await boot.goto("http://localhost:3001/login", {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      const response = await context.request.post(
        "http://localhost:3001/api/backend/auth/login",
        {
          headers: { Origin: "http://localhost:3001" },
          data: { email, password: fixture.password },
        },
      );
      assert.equal(response.status(), 201);
    }
    const page = teacher.pages()[0];
    page.setDefaultTimeout(45000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("http://localhost:3001/teacher", {
      waitUntil: "domcontentloaded",
    });
    await page
      .getByRole("button", { name: /Universidad del Conocimiento/ })
      .click();
    await page.getByRole("button", { name: /Facultad de Ciencias/ }).waitFor();
    await page.screenshot({
      path: ".temp/faculty-step-desktop.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Añadir facultad", exact: true })
      .click();
    await page.getByRole("dialog", { name: "Añade tu facultad" }).waitFor();
    assert.equal(
      await page.getByLabel("Nombre oficial de la universidad").count(),
      0,
    );
    await page.screenshot({
      path: ".temp/faculty-modal-desktop.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Crear mi espacio privado" })
      .click();
    await page.getByRole("alert").waitFor();
    await page.getByLabel("Facultad o escuela").fill("Facultad de Artes");
    await page
      .getByLabel("Carrera", { exact: true })
      .fill("Licenciatura en Artes Visuales");
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: "Crear mi espacio privado" })
      .click();
    await page.waitForURL("**/teacher/dashboard");
    await page.getByRole("link", { name: "Ver mis solicitudes" }).click();
    await page
      .getByRole("heading", { name: "Facultad de Artes", exact: true })
      .waitFor();
    assert(
      await page
        .getByText("En revisión · Privada", { exact: true })
        .isVisible(),
    );
    const pending = await teacher.request.get(
      "http://localhost:3001/api/backend/university-requests",
    );
    const originalRequest = (await pending.json()).find(
      (row) => row.kind === "FACULTY",
    );
    assert(originalRequest);
    const anonymous = await browser.newContext();
    const hidden = await anonymous.request.get(
      `http://localhost:3001/api/backend/universities/${originalRequest.universityId}`,
    );
    assert(
      !(await hidden.json()).faculties.some(
        (row) => row.id === originalRequest.facultyId,
      ),
    );
    console.log(
      "PASS faculty modal, validation, immediate enrollment and private visibility",
    );

    const adminPage = admin.pages()[0];
    adminPage.setDefaultTimeout(45000);
    adminPage.on("pageerror", (error) => errors.push(error.message));
    await adminPage.goto("http://localhost:3001/dashboard/requests", {
      waitUntil: "domcontentloaded",
    });
    await adminPage
      .locator("article")
      .filter({
        has: adminPage.getByRole("heading", {
          name: "Facultad de Artes",
          exact: true,
        }),
      })
      .getByRole("button", { name: "Revisar solicitud" })
      .click();
    await adminPage
      .getByLabel("Observaciones (obligatorias si solicitas correcciones)")
      .fill("Comprueba el nombre oficial de la facultad.");
    await adminPage
      .getByRole("button", { name: "Solicitar correcciones" })
      .click();
    await adminPage.getByRole("dialog").waitFor({ state: "hidden" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page
      .getByText("Requiere correcciones · Privada", { exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Corregir y reenviar" }).click();
    await page.getByRole("dialog", { name: "Corrige tu facultad" }).waitFor();
    assert.equal(
      await page.getByLabel("Nombre oficial de la universidad").count(),
      0,
    );
    await page
      .getByLabel("Facultad o escuela")
      .fill("Facultad de Artes y Diseno");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Reenviar a revisión" }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page
      .getByRole("heading", { name: "Facultad de Artes y Diseno", exact: true })
      .waitFor();
    const resubmitted = await teacher.request.get(
      "http://localhost:3001/api/backend/university-requests",
    );
    const correctedRequest = (await resubmitted.json()).find(
      (row) => row.id === originalRequest.id,
    );
    assert.equal(correctedRequest.facultyId, originalRequest.facultyId);
    assert.equal(correctedRequest.careerId, originalRequest.careerId);
    console.log(
      "PASS administrator feedback and corrections preserve the faculty and career",
    );

    await adminPage.reload({ waitUntil: "domcontentloaded" });
    await adminPage
      .locator("article")
      .filter({
        has: adminPage.getByRole("heading", {
          name: "Facultad de Artes y Diseno",
          exact: true,
        }),
      })
      .getByRole("button", { name: "Revisar solicitud" })
      .click();
    await adminPage
      .getByRole("button", { name: "Aprobar y añadir al catálogo" })
      .click();
    await adminPage.getByRole("dialog").waitFor({ state: "hidden" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByText("Facultad aprobada", { exact: true }).waitFor();
    const approved = await anonymous.request.get(
      `http://localhost:3001/api/backend/universities/${originalRequest.universityId}`,
    );
    const publicUniversity = await approved.json();
    assert.equal(publicUniversity.name, "Universidad del Conocimiento");
    assert.equal(publicUniversity.approvalStatus, "APPROVED");
    assert(
      publicUniversity.faculties.some(
        (row) => row.id === originalRequest.facultyId,
      ),
    );
    console.log(
      "PASS approval publishes the faculty inside its existing university",
    );

    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("http://localhost:3001/teacher", {
        waitUntil: "domcontentloaded",
      });
      await page
        .getByRole("button", { name: /Universidad del Conocimiento/ })
        .click();
      await page
        .getByRole("button", { name: /Facultad de Ciencias/ })
        .waitFor();
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      if (width === 390)
        await page.screenshot({
          path: ".temp/faculty-step-mobile.png",
          fullPage: true,
        });
      await page
        .getByRole("button", { name: "Añadir facultad", exact: true })
        .click();
      await page.getByRole("dialog", { name: "Añade tu facultad" }).waitFor();
      if (width === 390)
        await page.screenshot({
          path: ".temp/faculty-modal-mobile.png",
          fullPage: true,
        });
      await page.getByRole("button", { name: "Cancelar", exact: true }).click();
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      console.log("PASS faculty responsive layout and modal", width);
    }
    assert.deepEqual(errors, []);
    console.log("PASS no browser exceptions");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
