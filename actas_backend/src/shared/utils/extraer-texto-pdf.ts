// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfjs = require('pdfjs-dist/legacy/build/pdf') as typeof import('pdfjs-dist');

export async function extraerTextoPdf(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const pdf = await pdfjs.getDocument({ data }).promise;

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
