import { DOCUMENT } from '@angular/common';
import { Component, ContentChildren, Inject, OnInit, QueryList } from '@angular/core';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslationLoaderService } from '@pe/i18n-core';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';
import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';

import { PeSubscriptionSidebarService } from './services/sidebar.service';
import {
  GridExpandAnimation,
  MobileSidebarAnimation,
  SidebarAnimation,
  SidebarAnimationStates,
  SiteAnimationProgress,
} from './subscription.animation';
import { SubscriptionEnvService } from './api/subscription/subscription-env.service';

@Component({
  selector: 'pe-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
  animations: [SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
})
export class PeSubscriptionsComponent implements OnInit {
  protected destroyed$ = new ReplaySubject<boolean>();
  translationsReady$ = new BehaviorSubject(false);

  theme =  AppThemeEnum.default;
  isSidebarClosed = this.sidenavService.isSidebarClosed$;

  @ContentChildren(SidebarFiltersWrapperComponent)
  sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;

  private readonly gridAnimationStateStream$ = new BehaviorSubject<SidebarAnimationStates>(
    SidebarAnimationStates.Default,
  );
  private readonly gridAnimationProgressStream$ = new Subject<SiteAnimationProgress>();

  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();
  readonly gridAnimationProgress$: Observable<SiteAnimationProgress> = this.gridAnimationProgressStream$.asObservable();
  SiteAnimationProgress = SiteAnimationProgress;

  treeData = this.sidenavService.createSidebar();

  set gridAnimationProgress(value: SiteAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }

  get isDevMode(): boolean {
    return this.document.location.hostname.indexOf('localhost') > -1;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: any,
    public sidenavService: PeSubscriptionSidebarService,
    private translationLoaderService: TranslationLoaderService,
    @Inject(EnvService) private envService: SubscriptionEnvService,
    private messageBus: MessageBus,
  ) {
    this.messageBus.listen('subscriptions.toggle.sidebar').pipe(
      tap(() => this.toggleSidebar()),
    ).subscribe();
    if (this.envService.applicationId && !this.route.snapshot.children.length) {
      this.router.navigate([this.envService.applicationId, 'dashboard'], { relativeTo: this.route });
    }
  }

  ngOnInit() {

    this.initTranslations();
  }

  getActiveLink(nodeId) {
    const urlTree = this.router.parseUrl(this.router.url);
    const newId = urlTree.root.children.primary.segments[urlTree.root.children.primary.segments?.length - 1].path;
    return nodeId === newId;
  }

  navigateTolLink(item) {
    this.messageBus.emit(`subscriptions.navigate.${item.id}`, this.envService.applicationId);
    if (window.innerWidth <= 720) {
      this.toggleSidebar();
    }
  }


  toggleSidebar() {
    this.sidenavService.toggleSidebar();
  }

  private initTranslations(): void {
    this.translationLoaderService
      .loadTranslations(['products-list', 'products-editor', 'contacts-app', 'filters-app'])
      .pipe(
        catchError((err) => {
          console.warn('Cant load translations for domains', ['products-list', 'products-editor'], err);
          return of(true);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => {
        this.translationsReady$.next(true);
      });
  }
}
