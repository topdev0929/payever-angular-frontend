import { PebSidebarsStateModel } from './sidebars.state';


export class PebSetSidebarsAction {
  static readonly type = '[Peb/Editor] Set Sidebars';

  constructor(public payload: Partial<PebSidebarsStateModel>) {
  }
}
