import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, OnInit, QueryList } from '@angular/core';
import { catchError, filter, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'

import { AppThemeEnum, PeDestroyService, TreeFilterNode } from '@pe/common';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { TranslationLoaderService } from '@pe/i18n';

import {

  GridExpandAnimation,
  MobileSidebarAnimation,
  SidebarAnimation,
  SidebarAnimationProgress,
  SidebarAnimationStates,
} from './sidebar.animation';
import { BLOG_NAVIGATION } from '../../constants';

@Component({
  selector: 'peb-blog',
  templateUrl: './blog-root.component.html',
  styleUrls: ['./blog-root.component.scss'],
  animations: [SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeDestroyService ]
})
export class PebBlogComponent implements OnInit {
  translationsReady$ = new BehaviorSubject(false);

  @ContentChildren(SidebarFiltersWrapperComponent) sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;
  isSidebarClosed = window.innerWidth <= 720;
  loaded = false;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  blog: any = this.route.snapshot.data.blog;

  private readonly gridAnimationStateStream$ =
    new BehaviorSubject<SidebarAnimationStates>(SidebarAnimationStates.Default);
  private readonly gridAnimationProgressStream$ = new Subject<SidebarAnimationProgress>();


  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();
  readonly gridAnimationProgress$: Observable<SidebarAnimationProgress> =
    this.gridAnimationProgressStream$.asObservable();
  SidebarAnimationProgress = SidebarAnimationProgress;

  treeData: TreeFilterNode[] = BLOG_NAVIGATION;

  set gridAnimationProgress(value: SidebarAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }

  constructor(
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private envService: PebEnvService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
  ) {
    this.messageBus.listen('blog.toggle.sidebar').pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroy$),
    ).subscribe();

  }

  getActiveLink(nodeId) {
    const urlTree=this.router.parseUrl(this.router.url)
    const newId = urlTree.root.children.primary.segments[urlTree.root.children.primary.segments?.length - 1].path;
    return nodeId === newId;
  }

  toggleSidebar(close?: boolean) {
    this.isSidebarClosed = close ? close : !this.isSidebarClosed;
    this.cdr.markForCheck();
  }

  navigateTolLink(id) {
    this.messageBus.emit(`blog.navigate.${id}`, this.envService.blogId);
    if (window.innerWidth <= 720) {
      this.toggleSidebar(true);
    }
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
    ).subscribe((data) => {
      this.blog = this.route.snapshot.data.blog;
      this.cdr.detectChanges();
    })

    if (this.envService.blogId && !this.route.snapshot.children.length) {
      this.messageBus.emit(`blog.navigate.dashboard`, this.envService.blogId);

    }
    this.initTranslations();

  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['blog-app']).pipe(
      catchError(err => {
        console.warn('Cant load translations for domains', ['blog-app'], err);
        return of(true);
      }),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

}
