import jwt from 'jsonwebtoken';

const SECRET = process.env.ONLYOFFICE_JWT_SECRET ?? '';

/** Firma el config completo del editor: OnlyOffice Document Server valida este token antes de cargar el documento. */
function firmarConfig<T extends object>(config: T): string {
  return jwt.sign(config, SECRET);
}

const INTERNAL_URL = process.env.ONLYOFFICE_INTERNAL_URL ?? 'http://onlyoffice';

/** El Document Server no tenía cambios pendientes que guardar (nadie editó desde el último guardado): no es un error real. */
const ERROR_SIN_CAMBIOS = 4;

/**
 * Le pide al Document Server que guarde ya (botón "Guardar" manual): llama a su
 * CommandService server-a-server, lo que dispara el mismo callback de guardado
 * (status 6) que normalmente solo ocurre por autosave/forcesave del editor.
 */
export async function forzarGuardado(key: string): Promise<void> {
  const payload = { c: 'forcesave', key };
  const respuesta = await fetch(`${INTERNAL_URL}/coauthoring/CommandService.ashx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, token: firmarConfig(payload) }),
  });
  const data = (await respuesta.json()) as { error: number };
  if (data.error !== 0 && data.error !== ERROR_SIN_CAMBIOS) {
    throw new Error(`OnlyOffice CommandService devolvió error ${data.error}`);
  }
}

/**
 * Verifica el JWT que OnlyOffice envía en el callback de guardado.
 * Por defecto va en el header Authorization: Bearer <token> (configurable como JWT_HEADER en el contenedor).
 * Si no se configuró secreto (entorno de pruebas sin JWT_ENABLED), no se exige validación.
 */
export function verificarTokenCallback(authorizationHeader: string | undefined): boolean {
  if (!SECRET) return true;
  if (!authorizationHeader?.startsWith('Bearer ')) return false;
  try {
    jwt.verify(authorizationHeader.slice('Bearer '.length), SECRET);
    return true;
  } catch {
    return false;
  }
}

interface ConstruirConfigInput {
  actaId: string;
  documentUrl: string;
  key: string;
  titulo: string;
  usuarioId: string;
  usuarioEmail: string;
}

/** Arma el objeto config que el frontend pasa directo a `new DocsAPI.DocEditor(elementId, config)`. */
export function construirConfigDocumentoEditable(input: ConstruirConfigInput) {
  const callbackBaseUrl = process.env.ONLYOFFICE_CALLBACK_BASE_URL ?? 'http://backend:4000';

  const config = {
    document: {
      fileType: 'docx',
      key: input.key,
      title: `${input.titulo}.docx`,
      url: input.documentUrl,
      permissions: { edit: true, download: true, print: true },
    },
    documentType: 'word',
    editorConfig: {
      mode: 'edit',
      lang: 'es',
      callbackUrl: `${callbackBaseUrl}/api/v1/onlyoffice/${input.actaId}/callback`,
      user: { id: input.usuarioId, name: input.usuarioEmail },
      customization: { forcesave: true },
      // Una sola persona edita a la vez: mas liviano para un VPS de 2 nucleos compartidos.
      coEditing: { mode: 'strict', change: false },
    },
  };

  return { ...config, token: firmarConfig(config) };
}
