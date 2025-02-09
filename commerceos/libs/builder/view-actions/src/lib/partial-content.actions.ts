import { PebRenderElementModel } from "@pe/builder/core";

export class PebViewPartialContentLoadingAction {
  static readonly type = '[PEB/View] Partial Content Loading';

  constructor(
    public pageId: string,
    public element: PebRenderElementModel,
  ) {
  }
}
