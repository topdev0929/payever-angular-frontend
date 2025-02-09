import { AfterViewInit, Component, Input } from '@angular/core';
import { round, uniq } from 'lodash-es';
import { takeUntil, tap } from 'rxjs/operators';

import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { NavbarMenuItemInterface } from '../../../entities/navbar';

const AVAILABLE_SCALES = [0.25, 0.5, 0.75, 1, 1.5, 2, 4];

@Component({
  selector: 'pe-builder-editor-scale-select',
  templateUrl: 'editor-scale-select.component.html',
})
export class EditorScaleSelectComponent extends AbstractComponent implements AfterViewInit {
  @Input() editor: EditorState;

  label = '';
  menuInput: NavbarMenuItemInterface<number>[] = [];

  ngAfterViewInit(): void {
    this.editor.scale$
      .pipe(
        tap((scale: number) => {
          this.label = `${round(scale * 100)}%`;
          this.menuInput = this.generateMenuInput();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  onScaleSelected(value: NavbarMenuItemInterface): void {
    this.editor.scale = +value.value;
  }

  private generateMenuInput(): NavbarMenuItemInterface<number>[] {
    return uniq([...AVAILABLE_SCALES, this.editor.scale])
      .sort()
      .map((scale: number) => ({
        value: scale,
        label: `${round(scale * 100)}%`,
      }));
  }
}
