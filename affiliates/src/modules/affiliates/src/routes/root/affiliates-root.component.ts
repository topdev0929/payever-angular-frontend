import { Component, ContentChildren, OnInit, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppThemeEnum, PebEnvService } from '@pe/common';
import { TranslationLoaderService } from '@pe/i18n';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AbstractComponentDirective } from '../../misc/abstract.component';
import { PebaffiliatesSidebarService } from '../../services/sidebar.service';
import { GridExpandAnimation, MobileSidebarAnimation, SidebarAnimation, SidebarAnimationStates, SiteAnimationProgress } from './site.animation';

@Component({
  selector: 'affiliates-root',
  templateUrl: './affiliates-root.component.html',
  styleUrls: ['./affiliates-root.component.scss'],
  animations: [SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
})
export class PebAffiliatesComponent extends AbstractComponentDirective implements OnInit {
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
    private sidebarService: PebaffiliatesSidebarService,
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private envService: PebEnvService,
  ) {
    super();
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
  }

  ngOnInit() {
    this.theme = AppThemeEnum.default;
    this.treeData = this.sidebarService.createSidebar();

    this.initTranslations();
  }

  private initTranslations(): void {
    this.translationLoaderService
      .loadTranslations(['affiliates-app', 'filters-app'])
      .pipe(
        catchError((err) => {
          console.warn('Cant load translations for domains', ['affiliates-app', 'filters-app'], err);
          return of(true);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => {
        this.translationsReady$.next(true);
      });
  }
}
