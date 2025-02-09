import { ChangeDetectorRef, Component, ContentChildren, HostListener, OnInit, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeFilterNode, AppThemeEnum, EnvService } from '@pe/common';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AbstractComponent } from '../../misc/abstract.component';
import {
  GridExpandAnimation,
  MobileSidebarAnimation,
  SidebarAnimation,
  SidebarAnimationStates,
  SiteAnimationProgress,
} from '../root/site.animation';
import { PebShippingPackagesService } from './shipping-packages.service';
import { PebShippingSidebarService } from '../../services/sidebar.service';
import { TranslateService } from '@pe/i18n-core';

@Component({
  selector: 'peb-shipping-packages',
  templateUrl: './shipping-packages.component.html',
  styleUrls: ['./shipping-packages.component.scss'],
  animations: [SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
})
export class PebShippingPackagesComponent extends AbstractComponent implements OnInit {
  @ContentChildren(SidebarFiltersWrapperComponent)
  sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;
  isMobile = window.innerWidth <= 720;
  isTablet = window.innerWidth >= 720 && window.innerWidth <= 900;

  loaded = false;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  private readonly gridAnimationStateStream$ = new BehaviorSubject<SidebarAnimationStates>(SidebarAnimationStates.Default);
  private readonly gridAnimationProgressStream$ = new Subject<SiteAnimationProgress>();

  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();
  readonly gridAnimationProgress$: Observable<SiteAnimationProgress> = this.gridAnimationProgressStream$.asObservable();
  SiteAnimationProgress = SiteAnimationProgress;

  treeData: TreeFilterNode[] = [];

  set gridAnimationProgress(value: SiteAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private envService: EnvService,
    private cdr: ChangeDetectorRef,
    private sidebarService: PebShippingSidebarService,
    public packageService: PebShippingPackagesService,
    protected translateService: TranslateService,
  ) {
    super(translateService);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
    this.isTablet = window.innerWidth >= 720 && window.innerWidth <= 900;
    this.closeShippingSidebar();
  }

  getActiveLink(nodeId) {
    const splitURL = this.router.url.split('/');
    const newId = splitURL[splitURL.length - 1];
    const newNodeId = nodeId.split('/');
    return newNodeId[newNodeId.length - 1] === newId;
  }

  toggleSidebar() {
    this.packageService.isSidebarClosed$.next(!this.packageService.isSidebarClosed$.value);
  }

  navigateTolLink(e) {
    this.router.navigate([e.id], { relativeTo: this.route });
    this.packageService.isSidebarClosed$.next(this.isMobile);
  }

  ngOnInit() {
    this.closeShippingSidebar();
    this.packageService.refreshTreeData.subscribe(() => {
      this.getTreeData();
    });
  }

  getTreeData() {
    this.treeData = this.packageService.getTreeData();
    if (this.treeData.length !== 0) {
      this.navigateTolLink(this.treeData[0]);
    }
    this.cdr.detectChanges();
  }

  closeShippingSidebar() {
    if (this.isTablet && !this.sidebarService.isSidebarClosed$.value) {
      this.sidebarService.toggleSidebar('yes');
    }
  }
}
