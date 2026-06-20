import { ValidationError } from '../../../../shared/errors/domain-error';

export const ROLES = ['superadmin', 'admin', 'convocador', 'asistente'] as const;
export type RolValue = (typeof ROLES)[number];

export class Rol {
  private constructor(public readonly value: RolValue) {}

  public static create(value: string): Rol {
    if (!ROLES.includes(value as RolValue)) {
      throw new ValidationError(`Rol inválido: "${value}". Roles válidos: ${ROLES.join(', ')}`);
    }
    return new Rol(value as RolValue);
  }

  public puedeAsignarRoles(): boolean {
    return this.value === 'superadmin' || this.value === 'admin';
  }
}
