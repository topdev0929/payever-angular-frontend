import { PebIntegrationDataType } from './integration.data.model';
import { PebInteraction, PebInteractionBase, PebInteractionType } from './interaction.model';


export interface PebContextUpdateValueInteraction extends PebContextInteractionBase {
  type: PebInteractionType.ContextUpdateValue;
}

export interface PebContextPatchInteraction extends PebContextInteractionBase {
  type: PebInteractionType.ContextPatch;
}


export interface PebContextInteractionBase extends PebInteractionBase {
  contextId: string | 'root';
  dataType?: PebIntegrationDataType;
  value: any;
  patch?: any;
}

export const isContextInteraction = (m: Partial<PebInteraction>): m is PebContextInteractionBase =>
  m?.type === PebInteractionType.ContextUpdateValue
  || m?.type === PebInteractionType.ContextPatch;

export const isContextUpdateInteraction = (m: Partial<PebInteraction>): m is PebContextUpdateValueInteraction =>
  m?.type === PebInteractionType.ContextUpdateValue;

export const isContextPatchInteraction = (m: Partial<PebInteraction>): m is PebContextPatchInteraction =>
  m?.type === PebInteractionType.ContextPatch;



