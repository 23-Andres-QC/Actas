import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  WidthType, AlignmentType, TextRun, BorderStyle, VerticalAlign, ImageRun,
} from 'docx';
import { ActaResponseDTO } from '../application/dto/acta.dto';
import { AcuerdoResponseDTO } from '../../acuerdo/application/dto/acuerdo.dto';
import { AsistenteFirmadoInfo } from '../../asistencia/domain/asistente-firmado.entity';

const PROCESO_LABEL: Record<string, string> = {
  estrategico: 'Estratégico',
  operativo: 'Operativo',
  soporte: 'Soporte',
};

const B = { style: BorderStyle.SINGLE, size: 6, color: '000000' } as const;
const BORDER_ALL = { top: B, bottom: B, left: B, right: B };
const BORDER_NONE = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

const SPACING = { before: 80, after: 80 };

function p(runs: TextRun[], alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]): Paragraph {
  return new Paragraph({ children: runs, alignment, spacing: SPACING });
}

function bold(text: string): TextRun {
  return new TextRun({ text, bold: true });
}

function normal(text: string): TextRun {
  return new TextRun({ text });
}

function labelValor(label: string, valor: string): Paragraph {
  return p([bold(label), normal(valor)]);
}

function cell(
  paragraphs: Paragraph[],
  opts: { span?: number; width?: number; borders?: object; vAlign?: string } = {},
): TableCell {
  return new TableCell({
    columnSpan: opts.span,
    width: opts.width != null ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    borders: (opts.borders ?? BORDER_ALL) as any,
    verticalAlign: (opts.vAlign ?? VerticalAlign.CENTER) as any,
    children: paragraphs,
  });
}

function headerCell(text: string, span?: number, width?: number): TableCell {
  return cell([p([bold(text)], AlignmentType.CENTER)], { span, width });
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
      children: [headerCell('Acuerdos y Compromisos', 4)],
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
      const cumplido = acuerdo.porcentajeAvance >= 100 ? 'Sí ( X )  No (    )' : 'Sí (    )  No ( X )';
      return new TableRow({
        children: [
          dataCell(acuerdo.descripcion, 40),
          dataCell(acuerdo.responsableNombre ?? 'Sin asignar', 22),
          dataCell(new Date(acuerdo.fechaFin).toLocaleDateString('es-PE'), 23),
          dataCell(cumplido),
        ],
      });
    }),
  ];

  if (!acuerdos.length) {
    acuerdosRows.push(new TableRow({
      children: [cell([p([normal('Sin acuerdos registrados.')])], { span: 4 })],
    }));
  }

  const acuerdosTable = tableWidth(acuerdosRows);

  // ── Asistentes table ────────────────────────────────────────────────────────
  const firmas = await Promise.all(asistentes.map((a) => (a.firmaUrl ? descargarFirma(a.firmaUrl) : null)));

  const asistentesRows: TableRow[] = [
    new TableRow({
      children: [headerCell('Asistentes', 3)],
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
      children: [cell([p([normal('Sin asistentes registrados.')])], { span: 3 })],
    }));
  }

  const asistentesTable = tableWidth(asistentesRows);

  // ── ANEXOS ──────────────────────────────────────────────────────────────────
  const anexosTable = tableWidth([
    new TableRow({
      children: [
        cell([
          p([bold('ANEXOS: '), normal('(Listar los documentos o presentaciones en la reunión)')]),
        ]),
      ],
    }),
  ]);

  // ── Assemble document ───────────────────────────────────────────────────────
  const children = [
    new Paragraph({
      children: [new TextRun({ text: 'ACTA DE REUNION', bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
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

  const documento = new Document({ sections: [{ children }] });
  return Packer.toBuffer(documento);
}
