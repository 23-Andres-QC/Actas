import { Pool } from 'pg';

// Usuario
import { PostgresUsuarioRepository } from '../modules/usuario/infrastructure/postgres-usuario.repository';
import { ListarUsuariosUseCase } from '../modules/usuario/application/use-cases/listar-usuarios.use-case';
import { AsignarRolUseCase } from '../modules/usuario/application/use-cases/asignar-rol.use-case';
import { CrearUsuarioUseCase } from '../modules/usuario/application/use-cases/crear-usuario.use-case';
import { AutenticarUsuarioUseCase } from '../modules/usuario/application/use-cases/autenticar-usuario.use-case';
import { UsuarioController } from '../modules/usuario/interfaces/http/usuario.controller';
import { AuthController } from '../modules/usuario/interfaces/http/auth.controller';

// Acta
import { PostgresActaRepository } from '../modules/acta/infrastructure/postgres-acta.repository';
import { PostgresAvanceAcuerdosProvider } from '../modules/acta/infrastructure/postgres-avance-acuerdos.provider';
import { CrearActaUseCase } from '../modules/acta/application/use-cases/crear-acta.use-case';
import { ListarActasUseCase } from '../modules/acta/application/use-cases/listar-actas.use-case';
import { ObtenerActaUseCase } from '../modules/acta/application/use-cases/obtener-acta.use-case';
import { CalcularAvanceUseCase } from '../modules/acta/application/use-cases/calcular-avance.use-case';
import { SubirActaFisicaUseCase } from '../modules/acta/application/use-cases/subir-acta-fisica.use-case';
import { ActaController } from '../modules/acta/interfaces/http/acta.controller';

// Acuerdo
import { PostgresAcuerdoRepository } from '../modules/acuerdo/infrastructure/postgres-acuerdo.repository';
import { CrearAcuerdoUseCase } from '../modules/acuerdo/application/use-cases/crear-acuerdo.use-case';
import { ListarAcuerdosPorActaUseCase } from '../modules/acuerdo/application/use-cases/listar-acuerdos-por-acta.use-case';
import { ListarAcuerdosPorResponsableUseCase } from '../modules/acuerdo/application/use-cases/listar-acuerdos-por-responsable.use-case';
import { ActualizarAvanceAcuerdoUseCase } from '../modules/acuerdo/application/use-cases/actualizar-avance-acuerdo.use-case';
import { AcuerdoController } from '../modules/acuerdo/interfaces/http/acuerdo.controller';

// Asistencia
import { PostgresAsistenciaRepository } from '../modules/asistencia/infrastructure/postgres-asistencia.repository';
import { PostgresInasistentesProvider } from '../modules/asistencia/infrastructure/postgres-inasistentes.provider';
import { PostgresInasistenteRepository } from '../modules/asistencia/infrastructure/postgres-inasistente.repository';
import { PostgresAsistentesFirmadosProvider } from '../modules/asistencia/infrastructure/postgres-asistentes-firmados.provider';
import { RegistrarAsistenciaUseCase } from '../modules/asistencia/application/use-cases/registrar-asistencia.use-case';
import { ListarInasistentesUseCase } from '../modules/asistencia/application/use-cases/listar-inasistentes.use-case';
import { SubirEvidenciaInasistenciaUseCase } from '../modules/asistencia/application/use-cases/subir-evidencia-inasistencia.use-case';
import { ListarAsistentesFirmadosUseCase } from '../modules/asistencia/application/use-cases/listar-asistentes-firmados.use-case';
import { AsistenciaController } from '../modules/asistencia/interfaces/http/asistencia.controller';
import { SupabaseStorageAdapter } from '../modules/evidencia/infrastructure/supabase-storage.adapter';

// Evidencia
import { PostgresEvidenciaRepository } from '../modules/evidencia/infrastructure/postgres-evidencia.repository';
import { SubirEvidenciaUseCase } from '../modules/evidencia/application/use-cases/subir-evidencia.use-case';
import { ListarEvidenciasUseCase } from '../modules/evidencia/application/use-cases/listar-evidencias.use-case';
import { EvidenciaController } from '../modules/evidencia/interfaces/http/evidencia.controller';

// Área
import { PostgresAreaRepository } from '../modules/area/infrastructure/postgres-area.repository';
import { CrearAreaUseCase, ListarAreasUseCase } from '../modules/area/application/area.use-cases';
import { AreaController } from '../modules/area/interfaces/http/area.controller';

/**
 * Contenedor manual de dependencias: cablea repositorios (adaptadores) con
 * casos de uso y controladores. Sustituye a un framework de DI (tsyringe/
 * awilix) manteniendo el mismo principio — los módulos de dominio/aplicación
 * nunca instancian directamente sus dependencias de infraestructura.
 */
export function buildContainer(pool: Pool) {
  const areaRepository = new PostgresAreaRepository(pool);
  const areaController = new AreaController(new ListarAreasUseCase(areaRepository), new CrearAreaUseCase(areaRepository));
  const usuarioRepository = new PostgresUsuarioRepository(pool);
  const usuarioController = new UsuarioController(
    new ListarUsuariosUseCase(usuarioRepository),
    new AsignarRolUseCase(usuarioRepository),
    new CrearUsuarioUseCase(usuarioRepository),
  );
  const authController = new AuthController(new AutenticarUsuarioUseCase(usuarioRepository));

  const actaRepository = new PostgresActaRepository(pool);
  const avanceAcuerdosProvider = new PostgresAvanceAcuerdosProvider(pool);
  const acuerdoRepository = new PostgresAcuerdoRepository(pool);
  const storage = new SupabaseStorageAdapter();
  const asistentesFirmadosProviderForActa = new PostgresAsistentesFirmadosProvider(pool);
  const actaController = new ActaController(
    new CrearActaUseCase(actaRepository),
    new ListarActasUseCase(actaRepository, usuarioRepository),
    new ObtenerActaUseCase(actaRepository, usuarioRepository),
    new CalcularAvanceUseCase(actaRepository, avanceAcuerdosProvider),
    new ListarAcuerdosPorActaUseCase(acuerdoRepository, usuarioRepository),
    new SubirActaFisicaUseCase(actaRepository, storage),
    new ListarAsistentesFirmadosUseCase(asistentesFirmadosProviderForActa),
  );

  const acuerdoController = new AcuerdoController(
    new CrearAcuerdoUseCase(acuerdoRepository, usuarioRepository),
    new ListarAcuerdosPorActaUseCase(acuerdoRepository, usuarioRepository),
    new ActualizarAvanceAcuerdoUseCase(acuerdoRepository, actaRepository, avanceAcuerdosProvider),
    new ListarAcuerdosPorResponsableUseCase(acuerdoRepository, actaRepository),
  );

  const asistenciaRepository = new PostgresAsistenciaRepository(pool);
  const inasistentesProvider = new PostgresInasistentesProvider(pool);
  const asistentesFirmadosProvider = new PostgresAsistentesFirmadosProvider(pool);
  const inasistenteRepository = new PostgresInasistenteRepository(pool);
  const asistenciaController = new AsistenciaController(
    new RegistrarAsistenciaUseCase(asistenciaRepository, storage),
    new ListarInasistentesUseCase(inasistentesProvider),
    new SubirEvidenciaInasistenciaUseCase(inasistenteRepository, storage),
    new ListarAsistentesFirmadosUseCase(asistentesFirmadosProvider),
  );

  const evidenciaRepository = new PostgresEvidenciaRepository(pool);
  const evidenciaController = new EvidenciaController(
    new SubirEvidenciaUseCase(evidenciaRepository, storage, acuerdoRepository),
    new ListarEvidenciasUseCase(evidenciaRepository),
  );

  return {
    usuarioController,
    authController,
    areaController,
    actaController,
    acuerdoController,
    asistenciaController,
    evidenciaController,
  };
}
