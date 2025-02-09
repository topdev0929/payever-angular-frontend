import { PebAnimation } from './animation.model';
import { PebPartialContent } from './element.model';
import { PebIndexChange, PebInteraction, PebInteractionBase, PebInteractionType } from './interaction.model';
import { PebContentAlign, PebVerticalAlign } from './position.model';


export interface PebSliderLoadInteraction extends PebSlidesInteractionBase {
  type: PebInteractionType.SliderLoad;
}

export interface PebSliderChangeInteraction extends PebSlidesInteractionBase {
  type: PebInteractionType.SliderChange;
}

export interface PebSliderUnloadInteraction extends PebSlidesInteractionBase {
  type: PebInteractionType.SliderUnload;
}

export interface PebSliderPlayInteraction extends PebSlidesInteractionBase {
  type: PebInteractionType.SliderPlay;
}

export interface PebSliderPauseInteraction extends PebSlidesInteractionBase {
  type: PebInteractionType.SliderPause;
}

export interface PebSliderTogglePlayInteraction extends PebSlidesInteractionBase {
  type: PebInteractionType.SliderTogglePlay;
}

export interface PebSlidesInteractionBase extends PebInteractionBase {
  content: PebPartialContent;
  placeholder: { elementId: string; };
  slide: PebIndexChange,
  animation: Partial<PebAnimation>,
  align: {
    horizontal: PebContentAlign,
    vertical: PebVerticalAlign,
  };
  autoPlay: {    
    onLoad: boolean;
    duration: number;
    loop: boolean;
  },
}

export const isSliderInteraction = (m: Partial<PebInteraction>): m is PebInteractionBase =>
  m?.type === PebInteractionType.SliderLoad
  || m?.type === PebInteractionType.SliderUnload
  || m?.type === PebInteractionType.SliderChange
  || m?.type === PebInteractionType.SliderPlay
  || m?.type === PebInteractionType.SliderPause
  || m?.type === PebInteractionType.SliderTogglePlay;

export const isSliderLoadInteraction = (m: Partial<PebInteraction>): m is PebSliderLoadInteraction =>
  m?.type === PebInteractionType.SliderLoad;

export const isSliderUnloadInteraction = (m: Partial<PebInteraction>): m is PebSliderUnloadInteraction =>
  m?.type === PebInteractionType.SliderUnload;

export const isSliderChangeInteraction = (m: Partial<PebInteraction>): m is PebSliderChangeInteraction =>
  m?.type === PebInteractionType.SliderChange;

export const isSliderPlayInteraction = (m: Partial<PebInteraction>): m is PebSliderPlayInteraction =>
  m?.type === PebInteractionType.SliderPlay;

export const isSliderPauseInteraction = (m: Partial<PebInteraction>): m is PebSliderPauseInteraction =>
  m?.type === PebInteractionType.SliderPause;

export const isSliderPlayToggleInteraction = (m: Partial<PebInteraction>): m is PebSliderTogglePlayInteraction =>
  m?.type === PebInteractionType.SliderTogglePlay;
