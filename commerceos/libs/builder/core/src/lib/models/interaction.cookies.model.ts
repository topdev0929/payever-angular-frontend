import { PebInteraction, PebInteractionBase, PebInteractionType } from './interaction.model';


export interface PebCookiesAcceptInteraction extends PebInteractionBase {
  type: PebInteractionType.CookiesAccept;
}

export interface PebCookiesRejectInteraction extends PebInteractionBase {
  type: PebInteractionType.CookiesReject;
}

export const isCookiesInteraction = (m: Partial<PebInteraction>): m is PebInteractionBase =>
  m?.type === PebInteractionType.CookiesAccept
  || m?.type === PebInteractionType.CookiesReject;

export const isCookiesAcceptInteraction = (m: Partial<PebInteraction>): m is PebCookiesAcceptInteraction =>
  m?.type === PebInteractionType.CookiesAccept;

export const isCookiesRejectInteraction = (m: Partial<PebInteraction>): m is PebCookiesRejectInteraction =>
  m?.type === PebInteractionType.CookiesReject;
