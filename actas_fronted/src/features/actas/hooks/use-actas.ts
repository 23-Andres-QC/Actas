import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { actasApi } from '../api/actas.api';
import { Acta, ConsejoAcuerdo, CrearActaInput } from '../types';
import { Acuerdo } from '../../acuerdos/types';
import { extraerTextoPdf } from '../utils/extraer-texto-pdf';

export function useActas(areaId?: string) {
  return useQuery({
    queryKey: ['actas', areaId],
    queryFn: () => actasApi.listar(areaId),
  });
}

export function useActa(id: string) {
  return useQuery({
    queryKey: ['actas', id],
    queryFn: () => actasApi.detalle(id),
    enabled: Boolean(id),
  });
}

export function useCrearActa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearActaInput) => actasApi.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actas'] });
    },
  });
}

export function useSubirActaFisica() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, archivo }: { id: string; archivo: File }) => actasApi.subirActaFisica(id, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actas'] });
    },
  });
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function analizarConGemini(acta: Acta, acuerdos: Acuerdo[]): Promise<{ consejos: ConsejoAcuerdo[] }> {
  let textoPdf = '';
  if (acta.urlActaFisica?.includes('pdf')) {
    try {
      textoPdf = await extraerTextoPdf(acta.urlActaFisica);
    } catch {
      // PDF no disponible, continuamos sin él
    }
  }

  const hoy = new Date().toISOString().split('T')[0];
  const semaforoLabel = (s: string) =>
    s === 'verde' ? '🟢 Verde (en tiempo)' : s === 'amarillo' ? '🟡 Amarillo (en riesgo)' : '🔴 Rojo (vencido/crítico)';

  const prompt = `Eres un asesor estratégico institucional. Analiza los acuerdos de la siguiente acta de reunión y proporciona un consejo estratégico y acciones concretas para cada uno, considerando su estado de avance actual y fecha límite.

CONTEXTO DEL ACTA:
- Título: ${acta.titulo}
- Fecha de reunión: ${new Date(acta.fecha).toLocaleDateString('es-CO')}
- Objetivo: ${acta.objetivo ?? 'No especificado'}
- Agenda: ${acta.agenda ?? 'No especificada'}
- Fecha actual del análisis: ${hoy}
${textoPdf ? `\nCONTENIDO DEL ACTA FÍSICA (PDF):\n${textoPdf.slice(0, 3000)}` : ''}

ACUERDOS A ANALIZAR:
${acuerdos
  .map(
    (a, i) => `
${i + 1}. ID: ${a.id}
   Descripción: ${a.descripcion}
   Responsable: ${a.responsableNombre ?? 'Sin responsable'}
   Fecha límite: ${new Date(a.fechaFin).toLocaleDateString('es-CO')}
   Avance actual: ${a.porcentajeAvance}%
   Estado: ${semaforoLabel(a.estadoSemaforo)}`,
  )
  .join('\n')}

Responde ÚNICAMENTE con un JSON válido sin markdown ni texto adicional, con este formato exacto:
{
  "consejos": [
    {
      "acuerdoId": "<id exacto del acuerdo>",
      "consejo": "<consejo estratégico de 2-3 oraciones considerando el contexto, el estado actual y la fecha límite>",
      "acciones": ["<acción concreta y verificable 1>", "<acción concreta 2>", "<acción concreta 3>"]
    }
  ]
}`;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);

  const data = await res.json();
  const texto: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const limpio = texto.replace(/```json|```/g, '').trim();
  return JSON.parse(limpio) as { consejos: ConsejoAcuerdo[] };
}

export function useConsejos() {
  return useMutation({
    mutationFn: ({ acta, acuerdos }: { acta: Acta; acuerdos: Acuerdo[] }) =>
      analizarConGemini(acta, acuerdos),
  });
}
