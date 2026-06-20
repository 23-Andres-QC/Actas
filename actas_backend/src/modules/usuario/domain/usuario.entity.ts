import { Entity } from '../../../shared/kernel/entity';
import { Rol } from './value-objects/rol.vo';

interface UsuarioProps {
  nombre: string;
  email: string;
  rol: Rol;
  areaId: string | null;
  cargo: string | null;
}

export class Usuario extends Entity<UsuarioProps> {
  private constructor(props: UsuarioProps, id: string) {
    super(props, id);
  }

  public static create(props: UsuarioProps, id: string): Usuario {
    return new Usuario(props, id);
  }

  public get nombre(): string {
    return this.props.nombre;
  }

  public get email(): string {
    return this.props.email;
  }

  public get rol(): Rol {
    return this.props.rol;
  }

  public get areaId(): string | null {
    return this.props.areaId;
  }

  /** Cargo institucional (ej. "Coordinador Académico"), distinto del rol de permisos del sistema. */
  public get cargo(): string | null {
    return this.props.cargo;
  }

  public cambiarRol(nuevoRol: Rol): void {
    this.props.rol = nuevoRol;
  }
}
