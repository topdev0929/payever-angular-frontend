import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Inject, OnInit, QueryList } from '@angular/core';
import { catchError, filter, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'

import { AppThemeEnum, EnvService, MessageBus, PeDestroyService, TreeFilterNode } from '@pe/common';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';
import { TranslationLoaderService } from '@pe/i18n-core';

import {
  GridExpandAnimation,
  MobileSidebarAnimation,
  newSidebarAnimation,
  SidebarAnimation,
  SidebarAnimationProgress,
  SidebarAnimationStates,
} from './sidebar.animation';
import { SITE_NAVIGATION } from '../../constants';
import { SiteEnvService } from '../../service/site-env.service';
@Component({
  selector: 'peb-site-root',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss'],
  animations: [newSidebarAnimation, SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebSiteComponent implements OnInit {
  translationsReady$ = new BehaviorSubject(false);

  @ContentChildren(SidebarFiltersWrapperComponent) sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;
  isSidebarClosed = window.innerWidth <= 720;
  loaded = false;
  theme = (this.envService.businessData?.themeSettings?.theme) ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  site: any = this.route.snapshot.data.site;
  isMobile = window.innerWidth <= 720;


  menuState = 'out';


  private readonly gridAnimationStateStream$ =
    new BehaviorSubject<SidebarAnimationStates>(SidebarAnimationStates.Default);
  private readonly gridAnimationProgressStream$ = new Subject<SidebarAnimationProgress>();


  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();
  readonly gridAnimationProgress$:
    Observable<SidebarAnimationProgress> = this.gridAnimationProgressStream$.asObservable();
  SidebarAnimationProgress = SidebarAnimationProgress;


  treeData: TreeFilterNode[] = SITE_NAVIGATION;

  set gridAnimationProgress(value: SidebarAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }


  constructor(
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    @Inject(EnvService) private envService: SiteEnvService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,

  ) {
    this.messageBus.listen('site.toggle.sidebar').pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroy$),
    ).subscribe();
    if (this.envService.siteId && !this.route.snapshot.children.length) {
      this.router.navigate([this.envService.siteId, 'dashboard'], { relativeTo: this.route })
    }

    fromEvent(window, 'resize')
      .pipe(
        takeUntil(this.destroy$),
        tap(data => { this.isMobile = window.innerWidth <= 720; }),
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
    this.router.navigate([this.envService.siteId, id], { relativeTo: this.route }).then(() => {
      if (window.innerWidth <= 720) {
        this.toggleSidebar(true);
      }
    });

  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
    ).subscribe((data) => {
      this.site = this.route.snapshot.data.site;
      this.cdr.detectChanges();
    })
    this.initTranslations();

  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['site-app']).pipe(
      catchError(err => {
        console.warn('Cant load translations for domains', ['site-app'], err);
        return of(true);
      }),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

}
