import { Component, ViewChild } from '@angular/core';
import { TextEditorService } from '../../../../kit/text-editor/src/services';
import { TranslateService } from '../../../../kit/i18n/src/services/translate';
import { ExecuteCommandAction, ToggleToolbarAction, ExecuteCommands } from '../../../../kit/text-editor/src/common';
import { TextEditorToolbarComponent } from '../../../../kit/text-editor/src/toolbar';

@Component({
             selector: 'doc-text-editor',
             templateUrl: 'text-editor-doc.component.html',
             styleUrls: ['text-editor-doc.component.scss'],
           })
export class TextEditorDocComponent {
  readonly commands: typeof ExecuteCommands = ExecuteCommands;
  links: any[] = [
    {
      uuid: '123',
      title: 'Page 1'
    },
    {
      uuid: '223',
      title: 'Page 2'
    },
  ]

  exampleText: string = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s';
  @ViewChild('editorToolbar', {static: true}) editorToolbar: TextEditorToolbarComponent;

  constructor(
    public editorService: TextEditorService,
    protected translateService: TranslateService
    ) {
    this.translateService.addTranslations({
      ['ng-kit.text_editor.custom_link']: 'Custom Link',
      ['ng-kit.text_editor.open_in_new_tab']: 'Open in new tab',
      ['ng-kit.text_editor.link_to']: 'Custom Link',
    });
    this.editorService.toggleToolbarAction$
      .subscribe((event: ToggleToolbarAction) => {
        this.editorToolbar.handleActions(event);
      });
  }

  triggerCommand(action: ExecuteCommandAction): void {
    this.editorService.triggerCommand$.next(action);
  }
}
