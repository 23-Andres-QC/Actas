import { useRef, useState } from 'react';
import { X, Send, Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import type { Proceso, TipoReunion } from '../types';

interface Area {
  id: string;
  nombre: string;
}

export interface ActaAutocompletado {
  titulo?: string;
  tipoReunion?: TipoReunion;
  proceso?: Proceso;
  areaId?: string;
  lugar?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  objetivo?: string;
  agenda?: string;
}

interface RespuestaIA extends ActaAutocompletado {
  _camposFaltantes?: string[];
}

interface Mensaje {
  rol: 'usuario' | 'ia';
  texto: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function buildPrompt(areas: Area[], mensaje: string): string {
  const listaAreas = areas.map((a) => `- "${a.nombre}" (id: ${a.id})`).join('\n');
  return `Eres un asistente que extrae información para un formulario de actas de reunión institucional en español.

Áreas disponibles:
${listaAreas}

A partir de la descripción del usuario, extrae los campos que puedas identificar y devuelve SOLO un objeto JSON con esta estructura:
{
  "titulo": "asunto o título de la reunión",
  "tipoReunion": "interna" o "externa",
  "proceso": "estrategico", "operativo" o "soporte",
  "areaId": "uuid exacto del área de la lista de arriba",
  "lugar": "lugar físico o virtual",
  "fecha": "YYYY-MM-DD",
  "horaInicio": "HH:MM",
  "horaFin": "HH:MM",
  "objetivo": "objetivo de la reunión",
  "agenda": "agenda o temas a tratar",
  "_camposFaltantes": ["lista de campos requeridos que NO se mencionaron en la descripción, de entre: titulo, tipoReunion, proceso, areaId, lugar, fecha, horaInicio, horaFin, objetivo, agenda"]
}

Omite los campos que no se mencionen (excepto _camposFaltantes que siempre debe aparecer).
Responde ÚNICAMENTE con el JSON, sin texto adicional, sin bloques de código markdown.

Descripción: ${mensaje}`;
}

async function llamarGemini(areas: Area[], mensaje: string): Promise<RespuestaIA> {
  const body = {
    contents: [{ parts: [{ text: buildPrompt(areas, mensaje) }] }],
  };

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const texto: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const limpio = texto.replace(/```json|```/g, '').trim();
  return JSON.parse(limpio) as RespuestaIA;
}

interface Props {
  areas: Area[];
  onAutocompletar: (datos: ActaAutocompletado) => void;
  onCerrar: () => void;
}

export function GeminiChat({ areas, onAutocompletar, onCerrar }: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { rol: 'ia', texto: '¡Hola! Descríbeme la reunión y te mostraré una vista previa antes de llenar el formulario. Por ejemplo: "reunión interna, proceso estratégico, área Gestión de Calidad, revisión de indicadores del trimestre, sala de juntas, mañana a las 10:00."' },
  ]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [datosEnEspera, setDatosEnEspera] = useState<RespuestaIA | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scroll = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || cargando) return;

    setInput('');
    setError('');
    setDatosEnEspera(null);
    setMensajes((prev) => [...prev, { rol: 'usuario', texto }]);
    setCargando(true);

    try {
      const datos = await llamarGemini(areas, texto);
      const camposEncontrados = Object.keys(datos).filter((k) => k !== '_camposFaltantes');
      const faltantes = datos._camposFaltantes ?? [];

      if (camposEncontrados.length === 0) {
        setMensajes((prev) => [
          ...prev,
          { rol: 'ia', texto: 'No pude extraer información suficiente. Intenta ser más específico, indicando tipo de reunión, área, asunto o fecha.' },
        ]);
        scroll();
        return;
      }

      setDatosEnEspera(datos);

      const preview = [
        datos.titulo && `• Asunto: ${datos.titulo}`,
        datos.tipoReunion && `• Tipo: ${datos.tipoReunion}`,
        datos.proceso && `• Proceso: ${datos.proceso}`,
        datos.areaId && `• Área: ${areas.find((a) => a.id === datos.areaId)?.nombre ?? datos.areaId}`,
        datos.lugar && `• Lugar: ${datos.lugar}`,
        datos.fecha && `• Fecha: ${datos.fecha}`,
        datos.horaInicio && `• Hora inicio: ${datos.horaInicio}`,
        datos.horaFin && `• Hora fin: ${datos.horaFin}`,
        datos.objetivo && `• Objetivo: completado`,
        datos.agenda && `• Agenda: completada`,
      ]
        .filter(Boolean)
        .join('\n');

      const avisoFaltantes =
        faltantes.length > 0
          ? `\n\n⚠️ Campos que no mencionaste: ${faltantes.join(', ')}.`
          : '';

      setMensajes((prev) => [
        ...prev,
        { rol: 'ia', texto: `Vista previa — ${camposEncontrados.length} campo(s) identificado(s):\n${preview}${avisoFaltantes}\n\n¿Confirmas que llene el formulario con estos datos?` },
      ]);
    } catch {
      setError('No se pudo conectar con la IA. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setCargando(false);
      scroll();
    }
  };

  const confirmar = () => {
    if (!datosEnEspera) return;
    const { _camposFaltantes: _, ...datos } = datosEnEspera;
    onAutocompletar(datos);
    setDatosEnEspera(null);
    setMensajes((prev) => [...prev, { rol: 'ia', texto: '¡Listo! He llenado el formulario. Revisa y ajusta lo que necesites.' }]);
    scroll();
  };

  const cancelar = () => {
    setDatosEnEspera(null);
    setMensajes((prev) => [...prev, { rol: 'ia', texto: 'Entendido. Puedes describir la reunión de nuevo con más detalle.' }]);
    scroll();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[380px] flex-col rounded-2xl border border-border bg-background shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b bg-accent/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent-foreground" />
          <span className="text-sm font-semibold text-foreground">Asistente IA</span>
        </div>
        <button onClick={onCerrar} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex max-h-72 flex-col gap-3 overflow-y-auto p-4">
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-relaxed ${
                m.rol === 'usuario'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {m.texto}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> Analizando...
            </div>
          </div>
        )}
        {error && <p className="text-center text-xs text-destructive">{error}</p>}

        {/* Botones de confirmación */}
        {datosEnEspera && !cargando && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmar}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success/10 px-3 py-2 text-xs font-semibold text-success transition-colors hover:bg-success hover:text-white"
            >
              <CheckCircle2 className="size-3.5" /> Confirmar y llenar
            </button>
            <button
              type="button"
              onClick={cancelar}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary"
            >
              <XCircle className="size-3.5" /> Cancelar
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
            placeholder="Describe tu reunión..."
            className="min-h-0 resize-none text-sm"
            rows={2}
          />
          <Button type="button" size="icon" variant="hero" onClick={enviar} disabled={cargando || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">Enter para enviar · Shift+Enter nueva línea</p>
      </div>
    </div>
  );
}
