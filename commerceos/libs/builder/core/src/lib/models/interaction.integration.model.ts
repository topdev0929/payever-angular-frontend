import { PebInteraction, PebInteractionBase, PebInteractionType } from './interaction.model';

import { PebIntegrationAction } from '.';


export interface PebIntegrationInteraction extends PebIntegrationInteractionBase {
  type: PebInteractionType.IntegrationAction;
}

export interface PebIntegrationInteractionBase extends PebInteractionBase {
  integrationAction: PebIntegrationAction;
}

export const isIntegrationInteraction = (m: Partial<PebInteraction>): m is PebInteractionBase =>
  m?.type === PebInteractionType.IntegrationAction;

