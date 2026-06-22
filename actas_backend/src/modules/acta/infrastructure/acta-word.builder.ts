import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  WidthType, AlignmentType, TextRun, BorderStyle, VerticalAlign, ImageRun,
  Header, Footer, PageNumber, ShadingType,
} from 'docx';
import { ActaResponseDTO } from '../application/dto/acta.dto';
import { AcuerdoResponseDTO } from '../../acuerdo/application/dto/acuerdo.dto';
import { AsistenteFirmadoInfo } from '../../asistencia/domain/asistente-firmado.entity';

const PROCESO_LABEL: Record<string, string> = {
  estrategico: 'Estratégico',
  operativo: 'Operativo',
  soporte: 'Soporte',
};

const FONT = 'Calibri';
const COLOR_PRIMARY = '1E3A8A';
const COLOR_PRIMARY_LIGHT = 'DBEAFE';
const COLOR_SUBHEADER = 'EFF6FF';
const COLOR_BORDER = '94A3B8';
const COLOR_MUTED = '64748B';
const COLOR_SUCCESS = '15803D';
const COLOR_WHITE = 'FFFFFF';

const B = { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER } as const;
const BORDER_ALL = { top: B, bottom: B, left: B, right: B };
const BORDER_NONE = {
  top: { style: BorderStyle.NONE, size: 0, color: COLOR_WHITE },
  bottom: { style: BorderStyle.NONE, size: 0, color: COLOR_WHITE },
  left: { style: BorderStyle.NONE, size: 0, color: COLOR_WHITE },
  right: { style: BorderStyle.NONE, size: 0, color: COLOR_WHITE },
};

const SPACING = { before: 80, after: 80 };

function p(runs: TextRun[], alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]): Paragraph {
  return new Paragraph({ children: runs, alignment, spacing: SPACING });
}

function bold(text: string, color?: string): TextRun {
  return new TextRun({ text, bold: true, color });
}

function normal(text: string, color?: string): TextRun {
  return new TextRun({ text, color });
}

function labelValor(label: string, valor: string): Paragraph {
  return p([bold(label, COLOR_PRIMARY), normal(valor)]);
}

function cell(
  paragraphs: Paragraph[],
  opts: { span?: number; width?: number; borders?: object; vAlign?: string; fill?: string } = {},
): TableCell {
  return new TableCell({
    columnSpan: opts.span,
    width: opts.width != null ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    borders: (opts.borders ?? BORDER_ALL) as any,
    verticalAlign: (opts.vAlign ?? VerticalAlign.CENTER) as any,
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    children: paragraphs,
  });
}

/** Banda de título de sección (ej. "Acuerdos y Compromisos"): fondo azul institucional, texto blanco. */
function bandaCell(text: string, span?: number): TableCell {
  return cell([p([bold(text.toUpperCase(), COLOR_WHITE)], AlignmentType.CENTER)], { span, fill: COLOR_PRIMARY });
}

/** Encabezado de columna dentro de una tabla: fondo celeste claro, texto azul institucional. */
function headerCell(text: string, span?: number, width?: number): TableCell {
  return cell([p([bold(text, COLOR_PRIMARY)], AlignmentType.CENTER)], { span, width, fill: COLOR_SUBHEADER });
}

function dataCell(text: string, width?: number): TableCell {
  return cell([p([normal(text)])], { width });
}

function tableWidth(rows: TableRow[]): Table {
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function spacer(): Paragraph {
  return new Paragraph({ text: '', spacing: { before: 80, after: 80 } });
}

function check(isSelected: boolean): string {
  return isSelected ? '[X]' : '[  ]';
}

interface ImagenFirma {
  data: Buffer;
  tipo: 'png' | 'jpg';
}

/** Descarga la firma desde su URL firmada de Supabase para embeberla como imagen real en el Word. */
async function descargarFirma(url: string): Promise<ImagenFirma | null> {
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) return null;
    const contentType = respuesta.headers.get('content-type') ?? '';
    const tipo: ImagenFirma['tipo'] = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
    const data = Buffer.from(await respuesta.arrayBuffer());
    return { data, tipo };
  } catch {
    return null;
  }
}

/** Membrete institucional: nombre de la organización a la izquierda, fecha de generación a la derecha. */
function construirMembrete(): Table {
  const fechaGeneracion = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          cell([
            p([bold('ACTAS INSTITUCIONALES', COLOR_PRIMARY)]),
            new Paragraph({
              children: [new TextRun({ text: 'Gestión y seguimiento de compromisos', size: 16, color: COLOR_MUTED })],
              spacing: { before: 0, after: 0 },
            }),
          ], { borders: BORDER_NONE, width: 60 }),
          cell([
            new Paragraph({
              children: [new TextRun({ text: `Generado: ${fechaGeneracion}`, size: 16, color: COLOR_MUTED })],
              alignment: AlignmentType.RIGHT,
            }),
          ], { borders: BORDER_NONE, width: 40, vAlign: VerticalAlign.BOTTOM }),
        ],
      }),
    ],
  });
}

/** Línea divisoria delgada en el color institucional, debajo del membrete. */
function lineaDivisoria(): Paragraph {
  return new Paragraph({
    text: '',
    border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: COLOR_PRIMARY } },
    spacing: { before: 40, after: 240 },
  });
}

export async function buildActaWordBuffer(
  acta: ActaResponseDTO,
  acuerdos: AcuerdoResponseDTO[],
  asistentes: AsistenteFirmadoInfo[],
): Promise<Buffer> {
  const fecha = new Date(acta.fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  // ── Row 1: Tipo de reunión ──────────────────────────────────────────────────
  const tipoRow = new TableRow({
    children: [
      cell([p([bold(`INTERNA ${check(acta.tipoReunion === 'interna')}`)])], { width: 50 }),
      cell([p([bold(`EXTERNA ${check(acta.tipoReunion === 'externa')}`)])], { width: 50 }),
    ],
  });

  // ── Row 2: Proceso + Fecha ──────────────────────────────────────────────────
  const procesos = ['estrategico', 'operativo', 'soporte'];
  const procesoStr = procesos
    .map((p) => `${check(acta.proceso === p)} ${PROCESO_LABEL[p]}`)
    .join('   ');
  const procesoRow = new TableRow({
    children: [
      cell([labelValor('PROCESO:  ', procesoStr)], { width: 60 }),
      cell([labelValor('Fecha: ', fecha)], { width: 40 }),
    ],
  });

  // ── Row 3: Lugar ────────────────────────────────────────────────────────────
  const lugarRow = new TableRow({
    children: [
      cell([p([bold('Unidad Orgánica:')])], { width: 40 }),
      cell([labelValor('Especificar el lugar físico o virtual: ', acta.lugar)], { width: 60 }),
    ],
  });

  // ── Row 4: Asunto + Horario ─────────────────────────────────────────────────
  const asuntoRow = new TableRow({
    children: [
      cell([labelValor('Asunto de la reunión: ', acta.titulo)], { width: 55 }),
      cell([labelValor('Hora de Inicio: ', acta.horaInicio)], { width: 22 }),
      cell([labelValor('Hora Final: ', acta.horaFin)], { width: 23 }),
    ],
  });

  const headerTable = tableWidth([tipoRow, procesoRow, lugarRow, asuntoRow]);

  // ── Content block ───────────────────────────────────────────────────────────
  const contentRows: TableRow[] = [];

  if (acta.objetivo) {
    contentRows.push(new TableRow({
      children: [cell([labelValor('Objetivo de la reunión: ', acta.objetivo)])],
    }));
  }

  if (acta.convocadorNombre) {
    contentRows.push(new TableRow({
      children: [cell([labelValor('Nombre del que convoca: ', acta.convocadorNombre)])],
    }));
  }

  if (acta.agenda) {
    contentRows.push(new TableRow({
      children: [cell([labelValor('Agenda de la reunión: ', acta.agenda)])],
    }));
  }

  const contentTable = contentRows.length ? tableWidth(contentRows) : null;

  // ── Acuerdos table ──────────────────────────────────────────────────────────
  const acuerdosRows: TableRow[] = [
    new TableRow({
      children: [bandaCell('Acuerdos y Compromisos', 4)],
    }),
    new TableRow({
      children: [
        headerCell('Describir el Acuerdo y Compromiso', undefined, 40),
        headerCell('Responsable', undefined, 22),
        headerCell('Fecha Máxima de Cumplimiento', undefined, 23),
        headerCell('Se cumplió'),
      ],
    }),
    ...acuerdos.map((acuerdo) => {
      const cumplido = acuerdo.porcentajeAvance >= 100;
      const cumplidoTexto = cumplido ? 'Sí ( X )  No (    )' : 'Sí (    )  No ( X )';
      return new TableRow({
        children: [
          dataCell(acuerdo.descripcion, 40),
          dataCell(acuerdo.responsableNombre ?? 'Sin asignar', 22),
          dataCell(new Date(acuerdo.fechaFin).toLocaleDateString('es-PE'), 23),
          cell([p([bold(cumplidoTexto, cumplido ? COLOR_SUCCESS : undefined)])]),
        ],
      });
    }),
  ];

  if (!acuerdos.length) {
    acuerdosRows.push(new TableRow({
      children: [cell([p([normal('Sin acuerdos registrados.', COLOR_MUTED)])], { span: 4 })],
    }));
  }

  const acuerdosTable = tableWidth(acuerdosRows);

  // ── Asistentes table ────────────────────────────────────────────────────────
  const firmas = await Promise.all(asistentes.map((a) => (a.firmaUrl ? descargarFirma(a.firmaUrl) : null)));

  const asistentesRows: TableRow[] = [
    new TableRow({
      children: [bandaCell('Asistentes', 3)],
    }),
    new TableRow({
      children: [
        headerCell('Nombres y Apellidos', undefined, 40),
        headerCell('Cargo', undefined, 30),
        headerCell('Firma física o digital', undefined, 30),
      ],
    }),
    ...asistentes.map((a, i) => {
      const firma = firmas[i];
      const firmaCell = firma
        ? cell(
            [new Paragraph({
              children: [new ImageRun({ type: firma.tipo, data: firma.data, transformation: { width: 100, height: 50 } })],
              alignment: AlignmentType.CENTER,
            })],
            { width: 30 },
          )
        : dataCell(a.firmaUrl ? 'Digital ✓' : '', 30);
      return new TableRow({
        children: [dataCell(a.nombre, 40), dataCell(a.cargo ?? '', 30), firmaCell],
      });
    }),
  ];

  if (!asistentes.length) {
    asistentesRows.push(new TableRow({
      children: [cell([p([normal('Sin asistentes registrados.', COLOR_MUTED)])], { span: 3 })],
    }));
  }

  const asistentesTable = tableWidth(asistentesRows);

  // ── ANEXOS ──────────────────────────────────────────────────────────────────
  const anexosTable = tableWidth([
    new TableRow({
      children: [
        cell([
          p([bold('ANEXOS: ', COLOR_PRIMARY), normal('(Listar los documentos o presentaciones en la reunión)', COLOR_MUTED)]),
        ]),
      ],
    }),
  ]);

  // ── Assemble document ───────────────────────────────────────────────────────
  const children = [
    construirMembrete(),
    lineaDivisoria(),
    new Paragraph({
      children: [new TextRun({ text: 'ACTA DE REUNIÓN', bold: true, size: 36, color: COLOR_PRIMARY })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: acta.titulo, size: 24, color: COLOR_MUTED })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
    headerTable,
    spacer(),
    ...(contentTable ? [contentTable, spacer()] : []),
    acuerdosTable,
    spacer(),
    asistentesTable,
    spacer(),
    anexosTable,
  ];

  const documento = new Document({
    styles: {
      default: {
        document: { run: { font: FONT, size: 21 } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [new TextRun({ text: `Acta institucional · ${acta.titulo}`, size: 14, color: COLOR_MUTED })],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER } },
              spacing: { after: 120 },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Documento generado por Actas Institucionales · Página ', size: 14, color: COLOR_MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], size: 14, color: COLOR_MUTED }),
                new TextRun({ text: ' de ', size: 14, color: COLOR_MUTED }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: COLOR_MUTED }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children,
    }],
  });
  return Packer.toBuffer(documento);
}
