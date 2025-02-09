import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { DEFAULT_FONT_COLOR } from '../common/text-editor.constants';
import { ExecuteCommandAction, ToggleToolbarAction } from '../common/text-editor.interface';

@Injectable()
export class TextEditorService {
  toolbarColor: string = DEFAULT_FONT_COLOR;

  triggerCommand$: Subject<ExecuteCommandAction> = new Subject();
  toggleToolbarAction$: Subject<ToggleToolbarAction> = new Subject();

}
