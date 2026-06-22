import { useState } from 'react';
import { Loader2, Sparkles, Trash2, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useCrearAccion } from '../hooks/use-acuerdos';
import { Accion } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

interface AccionBorrador {
  descripcion: string;
  fechaFin: string;
}

async function sugerirAcciones(acuerdoDescripcion: string, accionesExistentes: Accion[], contexto: string): Promise<AccionBorrador[]> {
  const hoy = new Date().toISOString().split('T')[0];
  const existentes = accionesExistentes.length
    ? accionesExistentes.map((a) => `- ${a.descripcion} (vence: ${a.fechaFin.split('T')[0]})`).join('\n')
    : 'Ninguna aún.';

  const prompt = `Eres un asistente de gestión de compromisos institucionales.

Acuerdo: "${acuerdoDescripcion}"
Acciones ya existentes:
${existentes}
${contexto ? `Contexto adicional: ${contexto}` : ''}
Fecha de hoy: ${hoy}

Sugiere entre 2 y 5 acciones concretas, medibles y diferentes a las ya existentes para cumplir este acuerdo.
Devuelve SOLO un array JSON con esta estructura, sin texto adicional ni bloques markdown:
[{"descripcion": "...", "fechaFin": "YYYY-MM-DD"}, ...]`;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);

  const data = await res.json();
  const texto: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
  const limpio = texto.replace(/```json|```/g, '').trim();
  return JSON.parse(limpio) as AccionBorrador[];
}

interface Props {
  acuerdoId: string;
  acuerdoDescripcion: string;
  accionesExistentes: Accion[];
  onClose: () => void;
}

export function IaAccionesModal({ acuerdoId, acuerdoDescripcion, accionesExistentes, onClose }: Props) {
  const crearAccion = useCrearAccion(acuerdoId);

  const [contexto, setContexto] = useState('');
  const [borradores, setBorradores] = useState<AccionBorrador[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const handleSugerir = async () => {
    setCargando(true);
    setError('');
    try {
      const sugerencias = await sugerirAcciones(acuerdoDescripcion, accionesExistentes, contexto);
      setBorradores(sugerencias);
    } catch {
      setError('No se pudo conectar con la IA. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const handleConfirmar = async () => {
    setGuardando(true);
    try {
      for (const b of borradores) {
        await crearAccion.mutateAsync({ descripcion: b.descripcion, fechaFin: new Date(b.fechaFin).toISOString() });
      }
      onClose();
    } catch {
      setError('Ocurrió un error al guardar las acciones. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const actualizarBorrador = (index: number, campo: keyof AccionBorrador, valor: string) => {
    setBorradores((prev) => prev.map((b, i) => (i === index ? { ...b, [campo]: valor } : b)));
  };

  const eliminarBorrador = (index: number) => {
    setBorradores((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl bg-card p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent-foreground" />
            <h3 className="font-display text-base font-semibold text-foreground">Sugerir acciones con IA</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Acuerdo: <span className="font-medium text-foreground">{acuerdoDescripcion}</span>
        </p>

        {borradores.length === 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Contexto adicional (opcional)</label>
              <Textarea
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="Ej: necesitamos enfocarnos en el área de ventas, plazo máximo 2 semanas..."
                rows={3}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="button" variant="hero" onClick={handleSugerir} disabled={cargando} className="w-full">
              {cargando ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {cargando ? 'Generando sugerencias...' : 'Generar sugerencias'}
            </Button>
          </div>
        )}

        {borradores.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">
              {borradores.length} acción(es) sugerida(s) — revisa y edita antes de guardar
            </p>
            <div className="space-y-3">
              {borradores.map((b, i) => (
                <div key={i} className="rounded-xl border bg-muted/20 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-xs font-bold text-muted-foreground">{i + 1}.</span>
                    <Textarea
                      value={b.descripcion}
                      onChange={(e) => actualizarBorrador(i, 'descripcion', e.target.value)}
                      rows={2}
                      className="flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarBorrador(i)}
                      className="mt-0.5 shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pl-5">
                    <label className="text-xs text-muted-foreground">Fecha límite:</label>
                    <Input
                      type="date"
                      value={b.fechaFin}
                      onChange={(e) => actualizarBorrador(i, 'fechaFin', e.target.value)}
                      className="h-7 w-auto text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex gap-2 border-t pt-3">
              <Button type="button" variant="outline" onClick={() => { setBorradores([]); setError(''); }} className="flex-1">
                Volver a sugerir
              </Button>
              <Button
                type="button"
                variant="hero"
                onClick={handleConfirmar}
                disabled={guardando || borradores.length === 0}
                className="flex-1"
              >
                {guardando ? <Loader2 className="size-4 animate-spin" /> : null}
                {guardando ? 'Guardando...' : `Guardar ${borradores.length} acción(es)`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
