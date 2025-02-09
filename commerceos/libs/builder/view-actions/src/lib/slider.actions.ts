import { PebSliderLoadInteraction, PebSliderChangeInteraction, PebRenderElementModel, PebSliderUnloadInteraction, PebSliderPlayInteraction, PebSliderPauseInteraction, PebSliderTogglePlayInteraction } from "@pe/builder/core";

export class PebViewSliderLoadAction {
  static readonly type = '[PEB/View] Slider Load';

  constructor(
    public triggerElement: PebRenderElementModel,
    public interaction: PebSliderLoadInteraction,
  ) {
  }
}

export class PebViewSliderUnloadAction {
  static readonly type = '[PEB/View] Slider Unload';

  constructor(
    public triggerElement: PebRenderElementModel,
    public interaction: PebSliderUnloadInteraction,
  ) {
  }
}


export class PebViewSliderChangeAction {
  static readonly type = '[PEB/View] Slider Change Slide';

  constructor(
    public triggerElement: PebRenderElementModel,
    public interaction: PebSliderChangeInteraction,
  ) {
  }
}

export class PebViewSliderPlayAction {
  static readonly type = '[PEB/View] Slider Play';

  constructor(
    public triggerElement: PebRenderElementModel,
    public interaction: PebSliderPlayInteraction,
  ) {
  }
}

export class PebViewSliderPauseAction {
  static readonly type = '[PEB/View] Slider Pause';

  constructor(
    public triggerElement: PebRenderElementModel,
    public interaction: PebSliderPauseInteraction,
  ) {
  }
}

export class PebViewSliderTogglePlayAction {
  static readonly type = '[PEB/View] Slider Toggle Play';

  constructor(
    public triggerElement: PebRenderElementModel,
    public interaction: PebSliderTogglePlayInteraction,
  ) {
  }
}


export class PebViewSlideUpdatedAction {
  static readonly type = '[PEB/View] Slide Updated';

  constructor(
    public placeholderElementId: string,
    public slideIndex: number,
    public totalSlides: number,
  ) {
  }
}
