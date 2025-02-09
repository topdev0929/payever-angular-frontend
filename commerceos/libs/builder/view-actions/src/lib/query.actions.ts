import { PebViewQueryModel } from "@pe/builder/core";

export class PebViewQueryPatchAction {
  static readonly type = '[PEB/View] Query Patch';

  constructor(
    public update: Partial<PebViewQueryModel>,
  ) {
  }
}
