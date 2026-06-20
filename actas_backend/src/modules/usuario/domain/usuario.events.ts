import { DomainEvent } from '../../../shared/kernel/domain-event';

export class RolAsignadoEvent extends DomainEvent {
  public readonly name = 'usuario.rol_asignado';

  constructor(
    public readonly usuarioId: string,
    public readonly nuevoRol: string,
    public readonly asignadoPorId: string,
  ) {
    super();
  }
}
