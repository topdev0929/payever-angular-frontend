import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { PebScreen } from '@pe/builder/core';
import { PebEditorState, PebOptionsState, PebSetScreenAction } from '@pe/builder/state';
import { PebDeviceService } from '@pe/common';

import { PebScreensDialogComponent } from '../screens/screens-dialog.component';

@Component({
  selector: 'peb-screen-dialog',
  templateUrl: './screen-dialog.component.html',
  styleUrls: ['./screen-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebScreenDialogComponent {
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebEditorState.screens) screens$!: Observable<PebScreen[]>;

  options$: Observable<OptionModel[]> = this.screens$.pipe(
    withLatestFrom(this.screen$),    
    map(([screens, screen]) => screens.map(scr => ({ screen: scr, active: scr.key === screen?.key })))
  );

  constructor(
    private readonly store: Store,
    private readonly dialog: MatDialog, 
    private readonly deviceService: PebDeviceService,
  ) {
  }

  setScreen(screen: PebScreen) {
    if (screen) {
      this.store.dispatch(new PebSetScreenAction(screen));
    }
  }

  openScreensDialog(): void {
    this.dialog.open(
      PebScreensDialogComponent, 
      {
        maxWidth: this.deviceService.isMobile ? '100%' : '600px',
        width: this.deviceService.isMobile ? '100%' : '600px',
      },
    );
  }
}


interface OptionModel {
  screen: PebScreen,
  active: boolean;
}