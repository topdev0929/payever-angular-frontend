import { PebRenderElementModel } from "@pe/builder/core";

export class PebViewCookiesAcceptAction {
  static readonly type = '[PEB/View] Cookies Accept';

  constructor(
    public triggerElement: PebRenderElementModel,
  ) {
  }
}

export class PebViewCookiesRejectAction {
  static readonly type = '[PEB/View] Cookies Reject';

  constructor(
    public triggerElement: PebRenderElementModel,
  ) {
  }
}
