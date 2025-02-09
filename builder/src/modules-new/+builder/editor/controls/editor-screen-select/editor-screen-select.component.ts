import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PebScreen } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { NavbarSelectInterface } from '../../../entities/navbar';

@Component({
  selector: 'pe-builder-editor-screen-select',
  templateUrl: './editor-screen-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorScreenSelectComponent {
  @Input() editor: EditorState;

  menuInput: NavbarSelectInterface[] = Object.values(PebScreen).map((screen: string) => ({
    value: screen,
    icon: `#icon-device-${screen}-24`,
  }));

  onScreenSelected(value: NavbarSelectInterface): void {
    this.editor.selectedElements = [];
    this.editor.screen = value.value as any;
  }

  iconForScreen(screen: PebScreen): string {
    return `#icon-device-${screen}-24`;
  }
}
