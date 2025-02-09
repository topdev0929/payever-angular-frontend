import { PebInteraction, PebInteractionBase, PebInteractionType } from './interaction.model';


export interface PebVideoPlayInteraction extends PebVideoInteractionBase {
  type: PebInteractionType.VideoPlay;
}

export interface PebVideoTogglePlayInteraction extends PebVideoInteractionBase {
  type: PebInteractionType.VideoTogglePlay;
}

export interface PebVideoPauseInteraction extends PebVideoInteractionBase {
  type: PebInteractionType.VideoPause;
}

export interface PebVideoInteractionBase extends PebInteractionBase {
  videoELementId?: string;
  reset?: boolean;
}

export const isVideoInteraction = (m: Partial<PebInteraction>): m is PebInteractionBase =>
  m?.type === PebInteractionType.VideoPlay
  || m?.type === PebInteractionType.VideoTogglePlay
  || m?.type === PebInteractionType.VideoPause;

export const isVideoPlayInteraction = (m: Partial<PebInteraction>): m is PebVideoPlayInteraction =>
  m?.type === PebInteractionType.VideoPlay;

export const isVideoTogglePlayInteraction = (m: Partial<PebInteraction>): m is PebVideoTogglePlayInteraction =>
  m?.type === PebInteractionType.VideoTogglePlay;


export const isVideoPauseInteraction = (m: Partial<PebInteraction>): m is PebVideoPauseInteraction =>
  m?.type === PebInteractionType.VideoPause;

