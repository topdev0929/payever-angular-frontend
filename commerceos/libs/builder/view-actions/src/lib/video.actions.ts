import { PebRenderElementModel, PebVideoPauseInteraction, PebVideoPlayInteraction } from "@pe/builder/core";

export class PebViewVideoPlayAction {
  static readonly type = '[PEB/View] Video Play';

  constructor(
    public triggerElement: PebRenderElementModel,
    public videoInteraction: PebVideoPlayInteraction,
  ) {
  }
}

export class PebViewVideoTogglePlayAction {
  static readonly type = '[PEB/View] Video Toggle Play';

  constructor(
    public elementId: string,
  ) {
  }
}

export class PebViewVideoPauseAction {
  static readonly type = '[PEB/View] Video Pause';

  constructor(
    public triggerElement: PebRenderElementModel,
    public videoInteraction: PebVideoPauseInteraction,
  ) {
  }
}

export class PebViewVideoStopAllAction {
  static readonly type = '[PEB/View] Video Stop All';

  constructor(
    public rootElementId?: string,
  ) {
  }
}
