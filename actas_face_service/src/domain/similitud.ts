/** Similitud coseno entre dos embeddings de la misma dimensión, en [-1, 1] (1 = idénticos). */
export function similitudCoseno(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Embeddings de dimensión distinta: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
