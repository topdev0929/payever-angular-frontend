import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

import { PebPage, PebScreen } from '@pe/builder-core';
import { WindowService } from '@pe/ng-kit/src/kit/window';

@Component({
  selector: 'pe-builder-theme-preview',
  templateUrl: './theme-preview.component.html',
  styleUrls: ['./theme-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePreviewComponent implements OnInit {

  loading$ = new BehaviorSubject<boolean>(true);

  PebScreen = PebScreen;

  frameScreenType$ = new BehaviorSubject<PebScreen>(PebScreen.Desktop);

  constructor(
    private dialogRef: MatDialogRef<ThemePreviewComponent>,
    private windowService: WindowService,
    @Inject(MAT_DIALOG_DATA) public data: { page: PebPage },
  ) {
  }

  ngOnInit(): void {
    this.windowService.isMobile$.subscribe(isMobile => {
      if (isMobile) {
        this.frameScreenType$.next(PebScreen.Mobile);
      }
      else {
        this.frameScreenType$.next(PebScreen.Desktop);
      }
    });
  }

  onLoad(): void {
    this.loading$.next(false);
  }

  close(): void {
    this.dialogRef.close();
  }

  changeScreenType(screen: PebScreen): void {
    this.frameScreenType$.next(screen);
  }

  get shopUrl(): string {
    return'https://seniera.payever.shop/';
  }
}
