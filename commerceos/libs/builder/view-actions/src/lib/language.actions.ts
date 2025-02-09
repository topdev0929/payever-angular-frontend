export class PebViewLanguageSetAction {
  static readonly type = '[PEB/View] Language Set';

  constructor(
    public languageKey: string,
  ) {
  }
}
