import jwt from 'jsonwebtoken';

const SECRET = process.env.ONLYOFFICE_JWT_SECRET ?? '';

/** Firma el config completo del editor: OnlyOffice Document Server valida este token antes de cargar el documento. */
function firmarConfig<T extends object>(config: T): string {
  return jwt.sign(config, SECRET);
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
