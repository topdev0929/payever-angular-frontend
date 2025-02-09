import { PebMap, PebScript } from '@pe/builder/core';


export class PebViewScriptsSetAction {
  static readonly type = '[PEB/View] Scripts Set';
  constructor(
    public scripts: PebMap<PebScript>,
  ) {
  }
}

export class PebViewScriptsRenderAction {
  static readonly type = '[PEB/View] Scripts Render';
}
