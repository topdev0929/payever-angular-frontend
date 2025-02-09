import { ChangeDetectorRef, ChangeDetectionStrategy, Component, ContentChildren, OnInit, QueryList, Inject } from '@angular/core';
import { catchError, filter, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'

import { AppThemeEnum, EnvService, MessageBus, TreeFilterNode } from '@pe/common';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';

import {

  GridExpandAnimation,
  MobileSidebarAnimation,
  SidebarAnimation,
  SidebarAnimationStates,
  SidebarAnimationProgress,
  newSidebarAnimation,
} from './sidebar.animation';
import { AbstractComponent } from '../../misc/abstract.component';
import { INVOICE_NAVIGATION } from '../../constants';
import { TranslationLoaderService } from '@pe/i18n';
import { InvoiceEnvService } from '../../services/invoice-env.service';

@Component({
  selector: 'pe-invoice',
  templateUrl: './invoice-root.component.html',
  styleUrls: ['./invoice-root.component.scss'],
  animations: [newSidebarAnimation,SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation,],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeInvoiceComponent extends AbstractComponent implements OnInit {
  translationsReady$ = new BehaviorSubject(false);

  @ContentChildren(SidebarFiltersWrapperComponent) sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;
  isSidebarClosed = window.innerWidth <= 720;
  loaded = false;
  theme = (this.envService.businessData?.themeSettings?.theme) ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  isMobile  = window.innerWidth <= 720 ;


  menuState:string = 'out';


  private readonly gridAnimationStateStream$ = new BehaviorSubject<SidebarAnimationStates>(SidebarAnimationStates.Default);
  private readonly gridAnimationProgressStream$ = new Subject<SidebarAnimationProgress>();


  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();
  readonly gridAnimationProgress$: Observable<SidebarAnimationProgress> = this.gridAnimationProgressStream$.asObservable();
  SidebarAnimationProgress = SidebarAnimationProgress;

  treeData: TreeFilterNode[] = INVOICE_NAVIGATION;

  set gridAnimationProgress(value: SidebarAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }

  constructor(
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    @Inject(EnvService) private envService: InvoiceEnvService,
    private cdr: ChangeDetectorRef

  ) {
    super();
    this.messageBus.listen('invoice.toggle.sidebar').pipe(
      tap((value) => this.toggleSidebar(value as boolean)),
      takeUntil(this.destroyed$),
    ).subscribe();

    fromEvent(window, 'resize')
      .pipe(
        takeUntil(this.destroyed$),
        tap(data=>{this.isMobile  = window.innerWidth <= 720 ;})
      )
      .subscribe();
  }

  getActiveLink(nodeId) {
    const urlTree = this.router.parseUrl(this.router.url)
    let newId = urlTree.root.children['primary'].segments[urlTree.root.children['primary'].segments?.length - 1].path;
    newId = newId === "invoice" ? 'list' : newId;
    return nodeId === newId;
  }

  toggleSidebar(close?: boolean) {
    this.isSidebarClosed = close ? close : !this.isSidebarClosed;
    this.menuState = close?  'out':this.menuState === 'out' ? 'in' : 'out';
    this.cdr.markForCheck();
  }

  navigateTolLink(id) {
    this.router.navigate([id],{relativeTo:this.route}).then(()=>{
      if (window.innerWidth <= 720) {
        this.toggleSidebar(true);
      }
    });

  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((data) => {
      this.cdr.detectChanges();
    })
    this.initTranslations();

  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['invoice-app']).pipe(
      catchError(err => {
        console.warn('Cant load translations for domains', ['invoice-app'], err);
        return of(true);
      }),
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

}
