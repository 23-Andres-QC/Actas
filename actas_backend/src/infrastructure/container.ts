import { Pool } from 'pg';

// Usuario
import { PostgresUsuarioRepository } from '../modules/usuario/infrastructure/postgres-usuario.repository';
import { ListarUsuariosUseCase } from '../modules/usuario/application/use-cases/listar-usuarios.use-case';
import { AsignarRolUseCase } from '../modules/usuario/application/use-cases/asignar-rol.use-case';
import { AsignarAreaUseCase } from '../modules/usuario/application/use-cases/asignar-area.use-case';
import { CrearUsuarioUseCase } from '../modules/usuario/application/use-cases/crear-usuario.use-case';
import { AutenticarUsuarioUseCase } from '../modules/usuario/application/use-cases/autenticar-usuario.use-case';
import { GuardarFirmaUsuarioUseCase } from '../modules/usuario/application/use-cases/guardar-firma-usuario.use-case';
import { ObtenerFirmaUsuarioUseCase } from '../modules/usuario/application/use-cases/obtener-firma-usuario.use-case';
import { PostgresFirmaUsuarioRepository } from '../modules/usuario/infrastructure/postgres-firma-usuario.repository';
import { UsuarioController } from '../modules/usuario/interfaces/http/usuario.controller';
import { AuthController } from '../modules/usuario/interfaces/http/auth.controller';
import { FirmaUsuarioController } from '../modules/usuario/interfaces/http/firma-usuario.controller';

// Acta
import { PostgresActaRepository } from '../modules/acta/infrastructure/postgres-acta.repository';
import { PostgresAvanceAcuerdosProvider } from '../modules/acta/infrastructure/postgres-avance-acuerdos.provider';
import { CrearActaUseCase } from '../modules/acta/application/use-cases/crear-acta.use-case';
import { ListarActasUseCase } from '../modules/acta/application/use-cases/listar-actas.use-case';
import { ObtenerActaUseCase } from '../modules/acta/application/use-cases/obtener-acta.use-case';
import { CalcularAvanceUseCase } from '../modules/acta/application/use-cases/calcular-avance.use-case';
import { SubirActaFisicaUseCase } from '../modules/acta/application/use-cases/subir-acta-fisica.use-case';
import { PostgresActaDocumentoRepository } from '../modules/acta/infrastructure/postgres-acta-documento.repository';
import { ObtenerDocumentoEditableUseCase } from '../modules/acta/application/use-cases/obtener-documento-editable.use-case';
import { GuardarDocumentoEditableUseCase } from '../modules/acta/application/use-cases/guardar-documento-editable.use-case';
import { ActaController } from '../modules/acta/interfaces/http/acta.controller';

// Acuerdo
import { PostgresAcuerdoRepository } from '../modules/acuerdo/infrastructure/postgres-acuerdo.repository';
import { CrearAcuerdoUseCase } from '../modules/acuerdo/application/use-cases/crear-acuerdo.use-case';
import { ListarAcuerdosPorActaUseCase } from '../modules/acuerdo/application/use-cases/listar-acuerdos-por-acta.use-case';
import { ListarAcuerdosPorResponsableUseCase } from '../modules/acuerdo/application/use-cases/listar-acuerdos-por-responsable.use-case';
import { ActualizarAvanceAcuerdoUseCase } from '../modules/acuerdo/application/use-cases/actualizar-avance-acuerdo.use-case';
import { AcuerdoController } from '../modules/acuerdo/interfaces/http/acuerdo.controller';

// Acción
import { PostgresAccionRepository } from '../modules/accion/infrastructure/postgres-accion.repository';
import { RecalcularAvanceActaService } from '../modules/acuerdo/application/services/recalcular-avance-acta.service';
import { CrearAccionUseCase } from '../modules/accion/application/use-cases/crear-accion.use-case';
import { ListarAccionesPorAcuerdoUseCase } from '../modules/accion/application/use-cases/listar-acciones-por-acuerdo.use-case';
import { ActualizarCompletadaAccionUseCase } from '../modules/accion/application/use-cases/actualizar-completada-accion.use-case';
import { AccionController } from '../modules/accion/interfaces/http/accion.controller';

// Evidencia de acción
import { PostgresEvidenciaAccionRepository } from '../modules/evidencia-accion/infrastructure/postgres-evidencia-accion.repository';
import { SubirEvidenciaAccionUseCase } from '../modules/evidencia-accion/application/use-cases/subir-evidencia-accion.use-case';
import { ListarEvidenciasAccionUseCase } from '../modules/evidencia-accion/application/use-cases/listar-evidencias-accion.use-case';
import { EvidenciaAccionController } from '../modules/evidencia-accion/interfaces/http/evidencia-accion.controller';

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
  const storage = new SupabaseStorageAdapter();

  const areaRepository = new PostgresAreaRepository(pool);
  const areaController = new AreaController(new ListarAreasUseCase(areaRepository), new CrearAreaUseCase(areaRepository));
  const usuarioRepository = new PostgresUsuarioRepository(pool);
  const usuarioController = new UsuarioController(
    new ListarUsuariosUseCase(usuarioRepository),
    new AsignarRolUseCase(usuarioRepository),
    new CrearUsuarioUseCase(usuarioRepository),
    new AsignarAreaUseCase(usuarioRepository),
  );
  const authController = new AuthController(new AutenticarUsuarioUseCase(usuarioRepository));

  const firmaUsuarioRepository = new PostgresFirmaUsuarioRepository(pool);
  const firmaUsuarioController = new FirmaUsuarioController(
    new GuardarFirmaUsuarioUseCase(firmaUsuarioRepository, storage),
    new ObtenerFirmaUsuarioUseCase(firmaUsuarioRepository),
  );

  const actaRepository = new PostgresActaRepository(pool);
  const avanceAcuerdosProvider = new PostgresAvanceAcuerdosProvider(pool);
  const acuerdoRepository = new PostgresAcuerdoRepository(pool);
  const asistentesFirmadosProviderForActa = new PostgresAsistentesFirmadosProvider(pool);
  const obtenerActaUseCase = new ObtenerActaUseCase(actaRepository, usuarioRepository);
  const listarAcuerdosPorActaParaActa = new ListarAcuerdosPorActaUseCase(acuerdoRepository, usuarioRepository);
  const listarAsistentesFirmadosParaActa = new ListarAsistentesFirmadosUseCase(asistentesFirmadosProviderForActa);
  const actaDocumentoRepository = new PostgresActaDocumentoRepository(pool);
  const actaController = new ActaController(
    new CrearActaUseCase(actaRepository, usuarioRepository),
    new ListarActasUseCase(actaRepository, usuarioRepository),
    obtenerActaUseCase,
    new CalcularAvanceUseCase(actaRepository, avanceAcuerdosProvider),
    listarAcuerdosPorActaParaActa,
    new SubirActaFisicaUseCase(actaRepository, storage),
    listarAsistentesFirmadosParaActa,
    new ObtenerDocumentoEditableUseCase(
      actaDocumentoRepository,
      obtenerActaUseCase,
      listarAcuerdosPorActaParaActa,
      listarAsistentesFirmadosParaActa,
      storage,
    ),
    new GuardarDocumentoEditableUseCase(actaDocumentoRepository, storage),
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
    new RegistrarAsistenciaUseCase(asistenciaRepository, storage, actaRepository),
    new ListarInasistentesUseCase(inasistentesProvider),
    new SubirEvidenciaInasistenciaUseCase(inasistenteRepository, storage),
    new ListarAsistentesFirmadosUseCase(asistentesFirmadosProvider),
  );

  const evidenciaRepository = new PostgresEvidenciaRepository(pool);
  const evidenciaController = new EvidenciaController(
    new SubirEvidenciaUseCase(evidenciaRepository, storage, acuerdoRepository),
    new ListarEvidenciasUseCase(evidenciaRepository),
  );

  const recalcularAvanceActaService = new RecalcularAvanceActaService(actaRepository, avanceAcuerdosProvider);
  const accionRepository = new PostgresAccionRepository(pool);
  const accionController = new AccionController(
    new CrearAccionUseCase(accionRepository, acuerdoRepository, recalcularAvanceActaService),
    new ListarAccionesPorAcuerdoUseCase(accionRepository),
    new ActualizarCompletadaAccionUseCase(accionRepository, acuerdoRepository, recalcularAvanceActaService),
  );

  const evidenciaAccionRepository = new PostgresEvidenciaAccionRepository(pool);
  const evidenciaAccionController = new EvidenciaAccionController(
    new SubirEvidenciaAccionUseCase(evidenciaAccionRepository, storage, accionRepository, acuerdoRepository),
    new ListarEvidenciasAccionUseCase(evidenciaAccionRepository),
  );

  return {
    usuarioController,
    firmaUsuarioController,
    authController,
    areaController,
    actaController,
    acuerdoController,
    asistenciaController,
    evidenciaController,
    accionController,
    evidenciaAccionController,
  };
}
