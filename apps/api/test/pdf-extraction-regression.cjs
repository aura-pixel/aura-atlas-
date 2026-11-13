// Run after `pnpm --filter api build`.
const assert = require('node:assert/strict');
const PDFDocument = require('pdfkit');
const {
  PdfHypertextExtractor,
} = require('../dist/material/extractor/pdf-hypertext.extractor');

(async () => {
  const buffer = await new Promise((resolve) => {
    const chunks = [];
    const doc = new PDFDocument();
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.text('Unidad 1. Aprendizaje\n1.1 Fundamentos del aprendizaje');
    doc.end();
  });
  const extractor = new PdfHypertextExtractor();
  for (let index = 0; index < 3; index++) {
    const result = await extractor.extract(buffer);
    assert.equal(result.totalPages, 1);
    assert.match(result.text, /Fundamentos del aprendizaje/);
  }
  await assert.rejects(extractor.extract(Buffer.from('%PDF-1.4\nbroken PDF')));
  // A failed document must not terminate the host or poison the next read.
  assert.equal((await extractor.extract(buffer)).totalPages, 1);
  console.log(
    'PASS: repeated PDF reads, invalid document and recovery in isolated processes',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
