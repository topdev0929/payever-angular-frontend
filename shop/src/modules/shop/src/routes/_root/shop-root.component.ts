import { ChangeDetectorRef, ChangeDetectionStrategy, Component, ContentChildren, OnInit, QueryList, Inject } from '@angular/core';
import { catchError, filter, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'

import { AppThemeEnum, EnvService, MessageBus, TreeFilterNode, PeDestroyService } from '@pe/common';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';
import { TranslationLoaderService } from '@pe/i18n';

import {

  GridExpandAnimation,
  MobileSidebarAnimation,
  SidebarAnimation,
  SidebarAnimationProgress,
  newSidebarAnimation,
  SidebarAnimationStates,
} from './sidebar.animation';
import { SHOP_NAVIGATION } from '../../constants';
import { ShopEnvService } from '../../services/shop-env.service';

@Component({
  selector: 'peb-shop',
  templateUrl: './shop-root.component.html',
  styleUrls: ['./shop-root.component.scss'],
  animations: [newSidebarAnimation, SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation,],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebShopComponent implements OnInit {
  translationsReady$ = new BehaviorSubject(false);

  @ContentChildren(SidebarFiltersWrapperComponent) sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;
  isSidebarClosed = window.innerWidth <= 720;
  loaded = false;
  theme = (this.shopEnvService.businessData?.themeSettings?.theme) ?
    AppThemeEnum[this.shopEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  shop: any = this.route.snapshot.data.shop;
  isMobile = window.innerWidth <= 720;


  menuState: string = 'out';


  private readonly gridAnimationStateStream$ =
    new BehaviorSubject<SidebarAnimationStates>(SidebarAnimationStates.Default);
  private readonly gridAnimationProgressStream$ = new Subject<SidebarAnimationProgress>();


  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();
  readonly gridAnimationProgress$: Observable<SidebarAnimationProgress> =
    this.gridAnimationProgressStream$.asObservable();
  SidebarAnimationProgress = SidebarAnimationProgress;





  treeData: TreeFilterNode[] = SHOP_NAVIGATION;

  set gridAnimationProgress(value: SidebarAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }



  constructor(
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    @Inject(EnvService) private shopEnvService: ShopEnvService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,

  ) {
    this.messageBus.listen('shop.toggle.sidebar').pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroy$),
    ).subscribe();
    if (this.shopEnvService.shopId && !this.route.snapshot.children.length) {
      this.router.navigate([this.shopEnvService.shopId, 'dashboard'], { relativeTo: this.route })
    }

    fromEvent(window, 'resize')
      .pipe(
        takeUntil(this.destroy$),
        tap(data => { this.isMobile = window.innerWidth <= 720; })
      )
      .subscribe();
  }

  getActiveLink(nodeId) {
    const urlTree = this.router.parseUrl(this.router.url)
    const newId = urlTree.root.children.primary.segments[urlTree.root.children.primary.segments?.length - 1].path;
    return nodeId === newId;
  }

  toggleSidebar(close?: boolean) {
    this.isSidebarClosed = close ? close : !this.isSidebarClosed;
    this.menuState = close ? 'out' : this.menuState === 'out' ? 'in' : 'out';
    this.cdr.markForCheck();
  }

  navigateTolLink(id) {
    this.router.navigate([this.shopEnvService.shopId, id], { relativeTo: this.route }).then(() => {
      if (window.innerWidth <= 720) {
        this.toggleSidebar(true);
      }
    });

  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
    ).subscribe((data) => {
      this.shop = this.route.snapshot.data.shop;
      this.cdr.detectChanges();
    })

    this.initTranslations();

  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['shop-app']).pipe(
      catchError(err => {
        console.warn('Cant load translations for domains', ['shop-app'], err);
        return of(true);
      }),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

}
