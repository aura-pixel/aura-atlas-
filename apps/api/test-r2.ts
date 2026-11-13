import { R2Service } from "./src/storage/r2.service";

async function main() {
  const r2 = new R2Service();

  const key = "test/material-1788548321428.txt";

  const file = await r2.getFile(key);

  console.log("✅ Archivo recuperado de R2");

  console.log("Content-Type:");
  console.log(file.ContentType);

  console.log("Content-Length:");
  console.log(file.ContentLength);

  if (!file.Body) {
    throw new Error("R2 no devolvió el contenido.");
  }

  const text = await file.Body.transformToString();

  console.log("Contenido:");
  console.log(text);
}

main()
  .catch((error) => {
    console.error("❌ Error al recuperar archivo:");
    console.error(error);
    process.exit(1);
  });