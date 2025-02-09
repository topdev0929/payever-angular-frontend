import { PebElementDef, PebIntegrationEvent } from '../models';


export class PebIntegrationEventAction {
  static readonly type = '[PEB/Render] Integration Event';

  constructor(public event: string, public payload: PebIntegrationEvent) {
  }
}

export enum PebEditorPatchMode {
  Text = 'text',
  Move = 'move',
  Resize = 'resize',
}

export type PebElementDefUpdate = Pick<PebElementDef, 'id'> & Partial<PebElementDef>;
