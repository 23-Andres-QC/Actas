/** Extrae el path interno del bucket a partir de una URL firmada generada por SupabaseStorageAdapter. */
export function extraerPathDesdeUrlFirmada(bucket: string, url: string | null): string | null {
  if (!url) return null;
  const marcador = `/object/sign/${bucket}/`;
  const indice = url.indexOf(marcador);
  if (indice === -1) return null;
  const resto = url.slice(indice + marcador.length);
  const path = resto.split('?')[0];
  return path ? decodeURIComponent(path) : null;
}
