import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebRedoAction, PebUndoAction } from '@pe/builder/actions';
import { PebScreen } from '@pe/builder/core';
import { PebOptionsState, PebUndoState, PebUndoStateModel } from '@pe/builder/state';

import { toolbarIcons } from './toolbar.icons';


@Component({
  selector: 'peb-toolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebToolbarComponent {

  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebUndoState) private readonly undo$!: Observable<PebUndoStateModel>;

  undoDisabled$ = this.undo$.pipe(
    map(state => state.index === -1),
  );

  redoDisabled$ = this.undo$.pipe(
    map(state => state.index === state.length - 1),
  );

  constructor(
    private readonly store: Store,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
  ) {
    Object.entries(toolbarIcons).forEach(([name, url]) => {
      matIconRegistry.addSvgIcon(name, domSanitizer.bypassSecurityTrustResourceUrl(url));
    });
  }

  undo() {
    this.store.dispatch(new PebUndoAction());
  }

  redo() {
    this.store.dispatch(new PebRedoAction());
  }
}
