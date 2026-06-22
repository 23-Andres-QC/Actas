/** Puerto del dominio para la firma reutilizable guardada por cada usuario. */
export interface FirmaUsuarioRepository {
  obtenerPorUsuario(usuarioId: string): Promise<string | null>;
  guardar(usuarioId: string, firmaUrl: string): Promise<void>;
}
