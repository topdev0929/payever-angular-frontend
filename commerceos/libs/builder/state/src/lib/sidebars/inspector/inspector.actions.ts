import { PebInspectorStateModel } from './inspector.state';


export class PebSetInspectorAction {
  static readonly type = '[Peb/Sidebars] Set Inspector';

  constructor (public payload: Partial<PebInspectorStateModel>) {
  }
}
