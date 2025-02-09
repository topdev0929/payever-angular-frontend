import { PebTheme } from "@pe/builder/core";

export class PebViewThemeSetAction {
  static readonly type = '[PEB/View] Theme Set';

  constructor(
    public theme: PebTheme,
  ) {
  }
}
