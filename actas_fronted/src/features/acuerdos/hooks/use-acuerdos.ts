import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { acuerdosApi } from '../api/acuerdos.api';
import { CrearAccionInput, CrearAcuerdoInput, MiAcuerdo } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface PriorizacionItem {
  acuerdoId: string;
  prioridad: 'alta' | 'media' | 'baja';
  razon: string;
}

export interface ResultadoPriorizacion {
  mensaje: string;
  priorizacion: PriorizacionItem[];
}

async function priorizarConGemini(acuerdos: MiAcuerdo[]): Promise<ResultadoPriorizacion> {
  const hoy = new Date().toISOString().split('T')[0];
  const semaforoLabel = (s: string) =>
    s === 'verde' ? 'En tiempo' : s === 'amarillo' ? 'En riesgo' : 'Vencido/Crítico';

  const prompt = `Eres un asesor de gestión institucional. Analiza los compromisos asignados al usuario y determina cuáles debe priorizar esta semana.

Fecha de hoy: ${hoy}

Compromisos:
${acuerdos
  .map(
    (a) => `- ID: ${a.id}
  Descripción: ${a.descripcion}
  Acta: ${a.actaTitulo}
  Fecha límite: ${new Date(a.fechaFin).toLocaleDateString('es-CO')}
  Avance: ${a.porcentajeAvance}%
  Estado: ${semaforoLabel(a.estadoSemaforo)}
  Tiene evidencias: ${a.tieneEvidencias ? 'Sí' : 'No'}`,
  )
  .join('\n')}

Responde ÚNICAMENTE con JSON válido sin markdown:
{
  "mensaje": "párrafo breve con recomendación general para esta semana",
  "priorizacion": [
    { "acuerdoId": "<id exacto>", "prioridad": "alta|media|baja", "razon": "<1 oración explicando por qué>" }
  ]
}
Ordena de mayor a menor prioridad. Alta = vencido o próximo a vencer sin evidencias. Baja = con buen avance y tiempo de sobra.`;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const texto: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const limpio = texto.replace(/```json|```/g, '').trim();
  return JSON.parse(limpio) as ResultadoPriorizacion;
}

export function useAcuerdosMios() {
  return useQuery({
    queryKey: ['acuerdos-mios'],
    queryFn: () => acuerdosApi.listarMios(),
  });
}

export function usePriorizarAcuerdos() {
  return useMutation({
    mutationFn: (acuerdos: MiAcuerdo[]) => priorizarConGemini(acuerdos),
  });
}

export function useAcuerdosPorActa(actaId: string) {
  return useQuery({
    queryKey: ['acuerdos', actaId],
    queryFn: () => acuerdosApi.listarPorActa(actaId),
    enabled: Boolean(actaId),
  });
}

export function useCrearAcuerdo(actaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearAcuerdoInput) => acuerdosApi.crear(actaId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['acuerdos', actaId] }),
  });
}

export function useEditarAcuerdo(actaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; descripcion?: string; responsableId?: string; fechaInicio?: string; fechaFin?: string }) =>
      acuerdosApi.editarAcuerdo(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['acuerdos', actaId] }),
  });
}

export function useReordenarAcuerdos(actaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; orden: number }[]) => acuerdosApi.reordenarAcuerdos(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['acuerdos', actaId] }),
  });
}

export function useAccionesPorAcuerdo(acuerdoId: string) {
  return useQuery({
    queryKey: ['acciones', acuerdoId],
    queryFn: () => acuerdosApi.listarAcciones(acuerdoId),
    enabled: Boolean(acuerdoId),
  });
}

/** Crear/completar acciones recalcula en cascada el % del acuerdo y del acta (ver backend). */
function invalidarCascadaAvance(queryClient: ReturnType<typeof useQueryClient>, acuerdoId: string) {
  queryClient.invalidateQueries({ queryKey: ['acciones', acuerdoId] });
  queryClient.invalidateQueries({ queryKey: ['acuerdos'] });
  queryClient.invalidateQueries({ queryKey: ['actas'] });
}

export function useCrearAccion(acuerdoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearAccionInput) => acuerdosApi.crearAccion(acuerdoId, input),
    onSuccess: () => invalidarCascadaAvance(queryClient, acuerdoId),
  });
}

export function useActualizarCompletadaAccion(acuerdoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completada }: { id: string; completada: boolean }) =>
      acuerdosApi.actualizarCompletadaAccion(id, completada),
    onSuccess: () => invalidarCascadaAvance(queryClient, acuerdoId),
  });
}

export function useEditarAccion(acuerdoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; descripcion?: string; fechaFin?: string }) =>
      acuerdosApi.editarAccion(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['acciones', acuerdoId] }),
  });
}

export function useReordenarAcciones(acuerdoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; orden: number }[]) => acuerdosApi.reordenarAcciones(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['acciones', acuerdoId] }),
  });
}

export function useEvidenciasAccion(accionId: string) {
  return useQuery({
    queryKey: ['evidencias-accion', accionId],
    queryFn: () => acuerdosApi.listarEvidenciasAccion(accionId),
    enabled: Boolean(accionId),
  });
}

export function useSubirEvidenciaAccion(accionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (archivo: File) => acuerdosApi.subirEvidenciaAccion(accionId, archivo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evidencias-accion', accionId] }),
  });
}

export function useSubirEvidenciaAccionLink(accionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => acuerdosApi.subirEvidenciaAccionLink(accionId, url),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evidencias-accion', accionId] }),
  });
}
