export class Result<T, E = Error> {
  private constructor(
    private readonly _ok: boolean,
    private readonly value?: T,
    private readonly error?: E,
  ) {}

  public static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  public static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  public get isOk(): boolean {
    return this._ok;
  }

  public get isFail(): boolean {
    return !this._ok;
  }

  public getValue(): T {
    if (!this._ok) {
      throw new Error('No se puede obtener el valor de un Result fallido');
    }
    return this.value as T;
  }

  public getError(): E {
    if (this._ok) {
      throw new Error('No se puede obtener el error de un Result exitoso');
    }
    return this.error as E;
  }
}
