export abstract class Entity<Props> {
  protected readonly props: Props;
  public readonly id: string;

  protected constructor(props: Props, id: string) {
    this.props = props;
    this.id = id;
  }

  public equals(other?: Entity<Props>): boolean {
    if (!other) return false;
    return this.id === other.id;
  }
}
