import { PebOpenOverlayInteraction, PebRenderElementModel, PebSwapOverlayInteraction } from "@pe/builder/core";

export class PebViewOverlayOpenAction {
  static readonly type = '[PEB/View] Overlay Open';

  constructor(
    public triggerElement: PebRenderElementModel,
    public interaction: PebOpenOverlayInteraction,
  ) {
  }
}

export class PebViewOverlaySwapAction {
  static readonly type = '[PEB/View] Overlay Swap';

  constructor(
    public triggerElement: PebRenderElementModel,
    public interaction: PebSwapOverlayInteraction,
  ) {
  }
}

export class PebViewOverlayCloseAction {
  static readonly type = '[PEB/View] Overlay Close';
}
