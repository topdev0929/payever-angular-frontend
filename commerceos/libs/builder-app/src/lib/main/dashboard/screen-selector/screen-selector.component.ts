import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebScreen } from '@pe/builder/core';
import { PebEditorState, PebOptionsState, PebSetScreenAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { screenSelectorIcons } from './screen-selector-icons';

@Component({
  selector: 'pe-screen-selector',
  templateUrl: 'screen-selector.component.html',
  styleUrls: ['screen-selector.component.scss'],
  providers: [PeDestroyService],
})
export class PeScreenSelectorComponent {
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;
  @Select(PebEditorState.screens) readonly screens$!: Observable<PebScreen[]>;

  selectedScreen?: PebScreen;

  constructor(
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
  ) {
    this.screen$.pipe(
      tap(screen => this.selectedScreen = screen),
      takeUntil(this.destroy$),
    ).subscribe();

    Object.entries(screenSelectorIcons).forEach(([name, url]) => {
      matIconRegistry.addSvgIcon(name, domSanitizer.bypassSecurityTrustResourceUrl(url));
    });
  }

  changeScreen(screen: PebScreen): void {
    this.store.dispatch(new PebSetScreenAction(screen));
  }
}
