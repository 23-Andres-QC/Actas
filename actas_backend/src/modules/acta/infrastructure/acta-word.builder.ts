import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { ActaResponseDTO } from '../application/dto/acta.dto';
import { AcuerdoResponseDTO } from '../../acuerdo/application/dto/acuerdo.dto';

const TIPO_REUNION_LABEL: Record<string, string> = { interna: 'Interna', externa: 'Externa' };
const PROCESO_LABEL: Record<string, string> = {
  estrategico: 'Estratégico',
  operativo: 'Operativo',
  soporte: 'Soporte',
};
const SEMAFORO_LABEL: Record<string, string> = { verde: 'Verde', amarillo: 'Amarillo', rojo: 'Rojo' };

function celda(texto: string, opciones: { negrita?: boolean; ancho?: number } = {}): TableCell {
  return new TableCell({
    width: opciones.ancho ? { size: opciones.ancho, type: WidthType.PERCENTAGE } : undefined,
    children: [new Paragraph({ text: texto, style: opciones.negrita ? 'strong' : undefined })],
  });
}

function filaDato(etiqueta: string, valor: string): TableRow {
  return new TableRow({
    children: [celda(etiqueta, { negrita: true, ancho: 30 }), celda(valor, { ancho: 70 })],
  });
}

export async function buildActaWordBuffer(acta: ActaResponseDTO, acuerdos: AcuerdoResponseDTO[]): Promise<Buffer> {
  const fecha = new Date(acta.fecha).toLocaleDateString('es-PE');

  const datosTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      filaDato('Fecha', fecha),
      filaDato('Horario', `${acta.horaInicio} - ${acta.horaFin}`),
      filaDato('Lugar', acta.lugar),
      filaDato('Tipo de reunión', TIPO_REUNION_LABEL[acta.tipoReunion] ?? acta.tipoReunion),
      filaDato('Proceso', PROCESO_LABEL[acta.proceso] ?? acta.proceso),
      filaDato('Avance general', `${acta.porcentajeAvance}%`),
    ],
  });

  const seccionTexto = (titulo: string, contenido: string): Paragraph[] =>
    contenido
      ? [
          new Paragraph({ text: titulo, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }),
          ...contenido.split('\n').map((linea) => new Paragraph({ text: linea })),
        ]
      : [];

  const acuerdosTable = acuerdos.length
    ? new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              celda('Compromiso', { negrita: true, ancho: 35 }),
              celda('Responsable', { negrita: true, ancho: 20 }),
              celda('Fecha límite', { negrita: true, ancho: 15 }),
              celda('Estado', { negrita: true, ancho: 15 }),
              celda('Avance', { negrita: true, ancho: 15 }),
            ],
          }),
          ...acuerdos.map(
            (acuerdo) =>
              new TableRow({
                children: [
                  celda(acuerdo.descripcion, { ancho: 35 }),
                  celda(acuerdo.responsableNombre ?? 'Sin asignar', { ancho: 20 }),
                  celda(new Date(acuerdo.fechaFin).toLocaleDateString('es-PE'), { ancho: 15 }),
                  celda(SEMAFORO_LABEL[acuerdo.estadoSemaforo] ?? acuerdo.estadoSemaforo, { ancho: 15 }),
                  celda(`${acuerdo.porcentajeAvance}%`, { ancho: 15 }),
                ],
              }),
          ),
        ],
      })
    : new Paragraph({ text: 'Sin acuerdos registrados.' });

  const documento = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: acta.titulo, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: '', spacing: { after: 200 } }),
          datosTable,
          ...seccionTexto('Objetivo de la reunión', acta.objetivo),
          ...seccionTexto('Agenda de la reunión', acta.agenda),
          new Paragraph({ text: 'Acuerdos y compromisos', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }),
          acuerdosTable,
        ],
      },
    ],
  });

  return Packer.toBuffer(documento);
}
