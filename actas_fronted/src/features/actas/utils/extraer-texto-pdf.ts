import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extraerTextoPdf(url: string): Promise<string> {
  const pdf = await pdfjs.getDocument({ url }).promise;
  const paginas: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const textoPagina = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    paginas.push(textoPagina);
  }

  return paginas.join('\n');
}
