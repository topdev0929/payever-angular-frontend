import { Component, Input, Output, EventEmitter, ViewChildren, ViewEncapsulation, QueryList, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';

import { DrawerSettingsInterface } from '../../interfaces';

@Component({
  selector: 'pe-drawer',
  templateUrl: 'drawer.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DrawerComponent {

  @Input() autosize: boolean;
  @Input() containerClasses: string;
  @Input() set drawerSettings(settings: DrawerSettingsInterface[]) {
    this.drawerSettingsArray = settings;
    this.initDrawerSettings();
  };
  get drawerSettings(): DrawerSettingsInterface[] {
    return this.drawerSettingsArray;
  }

  @Output() backdropClick: EventEmitter<void> = new EventEmitter<void>();

  @ViewChildren('drawer') drawers: QueryList<MatDrawer>;
  @ViewChild('drawerContainer', { static: true }) drawerContainer: MatDrawerContainer;

  private drawerSettingsArray: DrawerSettingsInterface[];

  constructor(private chRef: ChangeDetectorRef) {
  }

  openFirst(): void {
    if (this.drawers.first) {
      this.drawers.first.open();
    }
  }

  openLast(): void {
    if (this.drawers.last) {
      this.drawers.last.open();
    }
  }

  openAll(): void {
    this.drawerContainer.open();
  }

  closeFirst(): void {
    if (this.drawers.first) {
      this.drawers.first.close();
    }
  }

  closeLast(): void {
    if (this.drawers.last) {
      this.drawers.last.close();
    }
  }

  closeAll(): void {
    this.drawerContainer.close();
  }

  onPositionChanged(settings: DrawerSettingsInterface): void {
    if (settings && settings.onPositionChanged) {
      settings.onPositionChanged();
    }
  }

  onOpenedChanged(settings: DrawerSettingsInterface): void {
    if (settings && settings.onOpenedChanged) {
      settings.onOpenedChanged();
    }
  }

  onBackdropClicked(): void {
    this.backdropClick.emit();
  }

  private initDrawerSettings(): void {
    if (this.drawerSettings) {
      for (const drawerSettingsItem of this.drawerSettings) {
        drawerSettingsItem.mode = drawerSettingsItem.mode || 'side';
        drawerSettingsItem.position = drawerSettingsItem.position || 'end';
      }
    }

    this.chRef.detectChanges();

    if (this.drawers && this.drawers.length > 0) {
      this.drawers.forEach((drawer: MatDrawer, index: number) => {
        drawer.closedStart.subscribe(() => {
          if (this.drawerSettings[index].onClosedStart) {
            this.drawerSettings[index].onClosedStart();
          }
        });
      });

      this.drawers.forEach((drawer: MatDrawer, index: number) => {
        drawer.openedStart.subscribe(() => {
          if (this.drawerSettings[index].onOpenedStart) {
            this.drawerSettings[index].onOpenedStart();
          }
        });
      });
    }
  }
}
