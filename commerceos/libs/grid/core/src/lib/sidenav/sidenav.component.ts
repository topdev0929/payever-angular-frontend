import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding, Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { fromEvent } from 'rxjs';
import { filter, map, pairwise, take, takeUntil, tap, throttleTime } from 'rxjs/operators';

import { PeDestroyService, PreloaderState, APP_TYPE, AppType } from '@pe/common';
import { PeFoldersSidenavClass } from '@pe/folders';

import { PeGridService } from '../grid.service';
import { PeGridMenuService } from '../menu';
import { PeGridMenuPosition } from '../misc/enums';
import { PeGridMenu, PeGridMenuItem } from '../misc/interfaces';

import { DEFAULT_SIDENAV, PeGridSidenavService } from './sidenav.service';

const MIN_WIDTH_MOBILE = 267;

@Component({
  selector: 'pe-grid-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  providers: [PeDestroyService],
})
export class PeGridSidenavComponent implements PeFoldersSidenavClass, OnDestroy, AfterViewInit {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  @Input() closeOnResize = true;
  @Input() sidenavName = DEFAULT_SIDENAV;
  @Input() smallPadding = false;
  @Input() messagesExtraSidebar = false;
  @Input() disableSkeleton = false;
  @Input() isOpenOnMobile = true;
  @Input() showSidenavHeader = true;
  @Input() sidenavMenu: PeGridMenu;
  @Input() sidenavTitle: string;
  @Input() mobileView = false;

  @Output() menuItemSelected = new EventEmitter<PeGridMenuItem>();
  @Output() bottomReached = new EventEmitter<boolean>();

  menuOpened = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private peGridMenuService: PeGridMenuService,
    private peGridService: PeGridService,
    private peGridSidenavService: PeGridSidenavService,
    private readonly destroy$: PeDestroyService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    this.resizeListener();
  }

  @HostBinding('class.pe-grid-sidenav_opened')
  get sidenavOpened(): boolean {
    return this.sidenavName === DEFAULT_SIDENAV
      ? this.peGridSidenavService.toggleOpenStatus$.value
      : this.peGridSidenavService.getSidenavOpenStatus(this.sidenavName).value;
  }

  @HostBinding('class.pe-grid-sidenav_embed-mod')
  get embedMod(): boolean {
    return this.peGridService.embedMod;
  }

  @HostBinding('class.pe-grid-mobile-view')
  get isMobile() {
    return this.mobileView;
  }

  get isGlobalLoading(): boolean {
    return !this.appType || this.disableSkeleton ? false : this.loading[this.appType];
  }

  get isNotDesktop (): boolean {
    return window.innerWidth <= 720 || this.mobileView;
  }

  ngAfterViewInit(): void {
    this.isOpenOnMobile && this.checkWidth();
  }

  ngOnDestroy(): void {
    this.sidenavName !== DEFAULT_SIDENAV && this.peGridSidenavService.removeSidenavStatus(this.sidenavName);
  }

  private closeSidenav = () => {
    if (this.sidenavName === DEFAULT_SIDENAV) {
      this.peGridSidenavService.toggleOpenStatus$.value
      && this.peGridSidenavService.toggleViewSidebar();
    } else {
      this.peGridSidenavService.sidenavOpenStatus[this.sidenavName].value
      && this.peGridSidenavService.toggleViewSidebar(this.sidenavName);
    }
  }

  public close(manual = false): void {
    (this.isNotDesktop || manual) && this.closeSidenav();
  }

  openMenu(element: ElementRef, minWidth: number): void {
    if (this.isGlobalLoading) {
      return;
    }

    this.menuOpened = !this.menuOpened;

    const config = {
      minWidth: this.isNotDesktop ? MIN_WIDTH_MOBILE : minWidth,
      offsetY: -8,
      position: PeGridMenuPosition.CenterBottom,
    };

    this.peGridMenuService.open(element, this.sidenavMenu, config);

    this.peGridMenuService.overlayClosed$.pipe(
      take(1),
      tap((menuItem: PeGridMenuItem) => {
        if (menuItem) {
          this.menuItemSelected.emit(menuItem);
        }
        this.menuOpened = false;
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  private resizeListener(): void {
    fromEvent(window, 'resize').pipe(
      map(event => (event.target as Window).innerWidth),
      throttleTime(200),
      pairwise(),
      filter(([w1, w2]: number[]) => w1 !== w2),
      tap(() => {
        this.checkWidth();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private checkWidth(): void {
    this.closeOnResize && this.isNotDesktop && this.closeSidenav();
  }

  public onBottomReached():void {
    this.bottomReached.emit(true);
  }
}
