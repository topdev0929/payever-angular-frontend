import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { pluck, takeUntil, tap } from 'rxjs/operators';

import { PebThemeStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { BuilderThemeComponent } from '../../../root/theme.component';

// TODO: Add 'catchError' behaviour

@Component({
  selector: 'pe-builder-theme-save-button',
  templateUrl: './theme-save-button.component.html',
  styleUrls: ['./theme-save-button.component.scss'],
})
export class ThemeSaveButtonComponent extends AbstractComponent {
  @Input() editor: EditorState;

  loading$ = new BehaviorSubject<boolean>(false);

  onThemeSave(): void {
    this.loading$.next(true);
    setTimeout(() => this.loading$.next(false), 2000);

    // console.warn('Theme saving');
    this.editor.editedElement = null;
    // this.themeCmp.themeLoadingSubject$.next(true);

    // this.themeCmp
    //   .onThemeSave()
    //   .pipe(
        // tap(_ => this.themeCmp.themeLoadingSubject$.next(false)),
      //   takeUntil(this.destroyed$),
      // )
      // .subscribe();
  }
}
