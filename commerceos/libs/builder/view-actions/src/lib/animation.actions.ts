import { PebAnimation, PebIndexChange } from "@pe/builder/core";

export class PebViewAnimationPlayAction {
  static readonly type = '[PEB/View] Animation Play';

  constructor(
    public elementId: string,
  ) {
  }
}

export class PebViewAnimationKeyframePlayAction {
  static readonly type = '[PEB/View] Animation Keyframe Play';

  constructor(
    public elementId: string,
    public keyframeChange: PebIndexChange,
  ) {
  }
}


export class PebViewAnimationPreviewAction {
  static readonly type = '[PEB/View] Animation Preview';

  constructor(
    public elementId: string,
    public animation: PebAnimation,
  ) {
  }
}
