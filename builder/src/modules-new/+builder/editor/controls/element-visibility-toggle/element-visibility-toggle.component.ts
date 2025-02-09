import { Component, Input } from '@angular/core';

import { PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';

@Component({
  selector: 'pe-builder-element-visibility-toggle',
  templateUrl: './element-visibility-toggle.component.html',
})
export class ElementVisibilityToggleComponent {
  @Input() editor: EditorState;
  @Input() pageStore: PebPageStore;
}
