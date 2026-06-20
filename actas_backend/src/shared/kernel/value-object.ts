export abstract class ValueObject<Props> {
  protected readonly props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }

  public equals(other?: ValueObject<Props>): boolean {
    if (!other) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
