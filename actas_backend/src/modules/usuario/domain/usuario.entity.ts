import { Entity } from '../../../shared/kernel/entity';
import { Rol } from './value-objects/rol.vo';

interface UsuarioProps {
  nombre: string;
  email: string;
  passwordHash: string;
  rol: Rol;
  areaId: string | null;
  esJefe: boolean;
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

  public get passwordHash(): string {
    return this.props.passwordHash;
  }

  public get rol(): Rol {
    return this.props.rol;
  }

  public get areaId(): string | null {
    return this.props.areaId;
  }

  public get esJefe(): boolean {
    return this.props.esJefe;
  }

  /** Cargo institucional (ej. "Coordinador Académico"), distinto del rol de permisos del sistema. */
  public get cargo(): string | null {
    return this.props.cargo;
  }

  public cambiarRol(nuevoRol: Rol): void {
    this.props.rol = nuevoRol;
  }

  public asignarArea(areaId: string, esJefe: boolean): void {
    this.props.areaId = areaId;
    this.props.esJefe = esJefe;
  }

  public removerDeArea(): void {
    this.props.areaId = null;
    this.props.esJefe = false;
  }
}
