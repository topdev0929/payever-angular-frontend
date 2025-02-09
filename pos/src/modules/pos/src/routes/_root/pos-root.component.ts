import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Inject, OnInit, QueryList } from '@angular/core';
import { catchError, filter, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router, UrlSegment } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser';

import {
  AppThemeEnum,
  EnvironmentConfigInterface,
  EnvService,
  MessageBus,
  PeDestroyService,
  PE_ENV,
  TreeFilterNode,
} from '@pe/common';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';
import { TranslationLoaderService } from '@pe/i18n';

import {

  GridExpandAnimation,
  MobileSidebarAnimation,
  SidebarAnimation,
  SidebarAnimationProgress,
  SidebarAnimationStates,
} from './sidebar.animation';
import { PosEnvService } from '../../services/pos/pos-env.service';

@Component({
  selector: 'peb-pos',
  templateUrl: './pos-root.component.html',
  styleUrls: ['./pos-root.component.scss'],
  animations: [SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeDestroyService ]
})
export class PebPosComponent implements OnInit {
  translationsReady$ = new BehaviorSubject(false);

  @ContentChildren(SidebarFiltersWrapperComponent) sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;
  isSidebarClosed = window.innerWidth <= 720;
  loaded = false;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  terminal: any = this.route.snapshot.data.terminal;

  private readonly gridAnimationStateStream$ =
    new BehaviorSubject<SidebarAnimationStates>(SidebarAnimationStates.Default);
  private readonly gridAnimationProgressStream$ = new Subject<SidebarAnimationProgress>();


  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();
  readonly gridAnimationProgress$: Observable<SidebarAnimationProgress> =
    this.gridAnimationProgressStream$.asObservable();
  SidebarAnimationProgress = SidebarAnimationProgress;

  treeData: TreeFilterNode[] = this.createTree();

  set gridAnimationProgress(value: SidebarAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }

  constructor(
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    @Inject(EnvService) private envService: PosEnvService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private domSanitizer: DomSanitizer,
  ) {
    this.messageBus.listen('pos.toggle.sidebar').pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  getActiveLink(nodeId) {
    const urlTree = this.router.parseUrl(this.router.url);
    const segmentsPath = urlTree.root.children.primary.segments.reduce(
      (acc, item: UrlSegment) => [...acc, item.path],
      [],
    );
    return segmentsPath.includes(nodeId);
  }

  toggleSidebar(close?: boolean) {
    this.isSidebarClosed = close ? close : !this.isSidebarClosed;
    this.cdr.markForCheck();
  }

  navigateTolLink(id) {
    this.messageBus.emit(`pos.navigate.${id}`, this.envService.posId);
    if (window.innerWidth <= 720) {
      this.toggleSidebar(true);
    }
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
    ).subscribe((data) => {
      this.terminal = this.route.snapshot.data.terminal;
      this.cdr.detectChanges();
    })

    if (this.envService.posId && !this.route.snapshot.children.length) {
      this.messageBus.emit(`pos.navigate.dashboard`, this.envService.posId);

    }
    this.initTranslations();
  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['pos-app', 'connect-integrations']).pipe(
      catchError(err => {
        console.warn('Cant load translations for domains', ['pos-app', 'connect-integrations'], err);
        return of(true);
      }),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

  private createTree(): TreeFilterNode[] {
    return [
      {
        id: 'connect',
        name: 'pos-app.navigation.connect',
        image: this.getCDNIcon('app-icon-connect.svg'),
      },
      {
        id: 'settings',
        name: 'pos-app.navigation.settings',
        image: this.getCDNIcon('app-icon-settings.svg'),
      },
    ];
  }

  private getCDNIcon(icon: string, folder = 'icons'): string {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/${folder}/${icon}`) as string;
  }

}
