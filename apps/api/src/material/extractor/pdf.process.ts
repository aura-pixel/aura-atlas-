import { PDFParse } from 'pdf-parse';

process.once('message', (data: Buffer) => {
  void (async () => {
    const parser = new PDFParse({ data: new Uint8Array(data) });
    try {
      const result = await parser.getText();
      if (result.total > 300 || result.text.length > 2_000_000) {
        throw new Error('PDF demasiado grande.');
      }
      await parser.destroy();
      process.send?.({ text: result.text, totalPages: result.total });
    } catch {
      process.send?.({ error: 'No se pudo procesar el PDF.' });
    }
  })();
});
