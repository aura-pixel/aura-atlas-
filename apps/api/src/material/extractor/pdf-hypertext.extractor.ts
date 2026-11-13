import { BadRequestException, Injectable } from '@nestjs/common';
import { fork } from 'child_process';
import { join } from 'path';
@Injectable()
export class PdfHypertextExtractor {
  async extract(buffer: Buffer): Promise<{ text: string; totalPages: number }> {
    if (
      buffer.subarray(0, 5).toString() !== '%PDF-' ||
      buffer.length > 20 * 1024 * 1024
    )
      throw new BadRequestException('PDF inválido o demasiado grande.');
    return new Promise((resolve, reject) => {
      // PDF parsing loads native libraries. A separate process also isolates
      // native crashes, which worker_threads cannot contain on Windows.
      const worker = fork(join(__dirname, 'pdf.process.js'), [], {
        execArgv: ['--max-old-space-size=128', '--max-semi-space-size=32'],
        serialization: 'advanced',
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      });
      let settled = false;
      const finish = (
        error?: string,
        result?: { text: string; totalPages: number },
      ) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        worker.kill();
        if (error) reject(new BadRequestException(error));
        else resolve(result!);
      };
      const timer = setTimeout(() => {
        finish('El PDF excedió el tiempo permitido.');
      }, 15000);
      worker.once(
        'message',
        (result: { error?: string; text: string; totalPages: number }) => {
          if (result.error) finish(result.error);
          else finish(undefined, result);
        },
      );
      worker.once('error', () => {
        finish('No se pudo procesar el PDF.');
      });
      worker.once('exit', () => {
        finish('Se interrumpió el procesamiento del PDF.');
      });
      worker.send(buffer, (error) => {
        if (error) finish('No se pudo procesar el PDF.');
      });
    });
  }
}
