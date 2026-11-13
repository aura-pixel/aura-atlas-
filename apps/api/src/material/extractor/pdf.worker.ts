import { parentPort, workerData } from 'worker_threads';
import { PDFParse } from 'pdf-parse';
(async () => {
  const parser = new PDFParse({ data: new Uint8Array(workerData) });
  try {
    const result = await parser.getText();
    if (result.total > 300 || result.text.length > 2_000_000)
      throw new Error('PDF demasiado grande.');
    parentPort?.postMessage({ text: result.text, totalPages: result.total });
  } finally {
    await parser.destroy();
  }
})().catch(() => {
  parentPort?.postMessage({ error: 'No se pudo procesar el PDF.' });
});
