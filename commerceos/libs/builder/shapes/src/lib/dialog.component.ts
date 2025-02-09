import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, UrlSegment } from '@angular/router';

import { PebDeviceService } from '@pe/common';

import { PebShapesComponent } from './shapes.component';

@Component({
  selector: 'peb-dialog',
  template: `
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebDialog {
  constructor(
    private dialog: MatDialog,
    private deviceService: PebDeviceService,
    private router: Router,
  ) {
    const dialogRef = this.dialog.open(
      PebShapesComponent,
      {
        closeOnNavigation: true,
        height: this.deviceService.isMobile ? '100%' : '82.3vh',
        maxWidth: this.deviceService.isMobile ? '100%' : '78.77vw',
        width: this.deviceService.isMobile ? '100%' : '78.77vw',
        panelClass: ['shapes-dialog'],
      },
    );

    dialogRef.afterClosed().subscribe(() => {
      const urlTree = this.router.parseUrl(this.router.url);
      const segments = urlTree.root.children.primary.segments;
      if (segments[segments.length - 1].path === 'insert') {
        segments.splice(-1);
      }
      const path = segments.reduce((acc, item: UrlSegment) => [...acc, item.path], []);

      this.router.navigate(path, { queryParamsHandling: 'merge' }).then();
    });
  }
}
