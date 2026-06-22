import QRCode from 'react-qr-code';
import { X } from 'lucide-react';
import { Acta } from '../types';

export function QrActaModal({ acta, onClose }: { acta: Acta; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-card p-6 shadow-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">QR de asistencia</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Escanea este código desde la app móvil para registrar asistencia y firmar el acta «{acta.titulo}».
        </p>
        <div className="rounded-xl bg-white p-4">
          <QRCode value={`${acta.id}:${acta.qrToken}`} size={200} />
        </div>
      </div>
    </div>
  );
}
