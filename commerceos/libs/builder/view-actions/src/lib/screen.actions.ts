export class PebViewScreenSetAction {
  static readonly type = '[PEB/View] Screen Set';

  constructor(
    public screenKey: string,
  ) {
  }
}
