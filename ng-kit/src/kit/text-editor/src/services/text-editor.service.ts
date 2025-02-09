import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ExecuteCommandAction, ToggleToolbarAction } from '../common/text-editor.interface';
import { DEFAULT_FONT_COLOR } from '../common';

@Injectable()
export class TextEditorService {
  toolbarColor: string = DEFAULT_FONT_COLOR;

  triggerCommand$: Subject<ExecuteCommandAction> = new Subject();
  toggleToolbarAction$: Subject<ToggleToolbarAction> = new Subject();

}
