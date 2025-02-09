import { Component, ContentChildren, OnInit, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppThemeEnum, EnvService } from '@pe/common';
import { TranslateService, TranslationLoaderService } from '@pe/i18n';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '../../misc/abstract.component';
import { PebShippingSidebarService } from '../../services/sidebar.service';
import { GridExpandAnimation, MobileSidebarAnimation, SidebarAnimation, SidebarAnimationStates, SiteAnimationProgress } from './site.animation';

@Component({
  selector: 'peb-shipping-root',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss'],
  animations: [SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
})
export class PebShippingComponent extends AbstractComponent implements OnInit {
  translationsReady$ = new BehaviorSubject(false);

  @ContentChildren(SidebarFiltersWrapperComponent)
  sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;
  isMobile = window.innerWidth <= 720;
  isSidebarClosed = this.sidebarService.isSidebarClosed$;

  loaded = false;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  private readonly gridAnimationStateStream$ = new BehaviorSubject<SidebarAnimationStates>(SidebarAnimationStates.Default);
  private readonly gridAnimationProgressStream$ = new Subject<SiteAnimationProgress>();

  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();
  readonly gridAnimationProgress$: Observable<SiteAnimationProgress> = this.gridAnimationProgressStream$.asObservable();
  SiteAnimationProgress = SiteAnimationProgress;

  treeData;

  set gridAnimationProgress(value: SiteAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }

  constructor(
    private sidebarService: PebShippingSidebarService,
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private envService: EnvService,
    protected translateService: TranslateService
  ) {
    super(translateService);
  }

  getActiveLink(nodeId) {
    const splitURL = this.router.url.split('/');
    const newNodeId = nodeId.split('/');
    const routeActive = splitURL.find((value) => {
      return value === newNodeId[0];
    });
    return routeActive;
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  navigateTolLink(e) {
    this.router.navigate([e.id], { relativeTo: this.route.parent });
    this.sidebarService.toggleSidebar(this.isMobile ? 'yes' : 'no');
  }

  ngOnInit() {
    this.treeData = this.sidebarService.createSidebar();
    this.sidebarService.toggleSidebar(this.isMobile ? 'yes' : 'no');
    this.initTranslations();
  }

  private initTranslations(): void {
    this.translationLoaderService
      .loadTranslations(['shipping-app', 'filters-app'])
      .pipe(
        catchError((err) => {
          console.warn('Cant load translations for domains', ['shipping-app', 'filters-app'], err);
          return of(true);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => {
        this.translationsReady$.next(true);
      });
  }
}
