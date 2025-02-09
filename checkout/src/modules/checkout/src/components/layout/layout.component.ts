import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { take, takeUntil, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { PeSimpleStepperService } from '@pe/stepper';
import { PeDataGridSidebarService } from '@pe/data-grid';
import { PePlatformHeaderService } from '@pe/platform-header';
import { TreeSidebarFilterComponent } from '@pe/sidebar';
import { PeDataGridFilterType, TreeFilterNode } from '@pe/common';
import { PePlatformHeaderConfig } from '@pe/platform-header/platform-header.types';

import { StorageService } from '../../services';
import { AbstractComponent } from '../abstract.component';
import { CheckoutInterface } from '../../interfaces';

@Component({
  selector: 'checkout-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent extends AbstractComponent implements OnInit, AfterViewInit {

  @ViewChild('sidebarFilter')
  set sidebarFilter(filter: TreeSidebarFilterComponent) {
    this.filterRef = filter;
    this.filterRef.updateValue([this.activeRouteFilter]);
  }

  private readonly mobileWidth = 720;
  isMobile = window.innerWidth <= this.mobileWidth;
  rotedByNavMenu: boolean;

  private filterRef: TreeSidebarFilterComponent;

  currentCheckout: CheckoutInterface;

  filters: PeDataGridFilterType[];
  isSidebarShown = true;
  theme: string = 'dark';
  checkoutIconLoadingError: boolean;

  icons = {
    1: '#icon-payments-block-16',
    2: '#icon-channels-block-16',
    3: '#icon-connect-block-16',
    4: '#icon-settings-block-16',
    5: '#icon-edit-block-16',
  };
  routes = {
    0: 'panel-checkout',
    1: 'panel-payments',
    2: 'panel-channels',
    3: 'panel-connect',
    4: 'panel-settings',
    5: 'panel-edit',
  };

  activeRouteFilter: TreeFilterNode;
  treeData: TreeFilterNode[] = [
    {
      id: '0',
      editing: false,
      noToggleButton: true,
      name: ' ',
      data: {
        transform: true
      }
    },
    {
      id: '1',
      noToggleButton: true,
      name: this.translateService.translate('info_boxes.panels.paymentOptions')
    },
    {
      id: '2',
      noToggleButton: true,
      name: this.translateService.translate('info_boxes.panels.channels')
    },
    {
      id: '3',
      noToggleButton: true,
      name: this.translateService.translate('info_boxes.panels.connect')
    },
    {
      id: '4',
      noToggleButton: true,
      name: this.translateService.translate('info_boxes.panels.settings')
    },
    {
      id: '5',
      noToggleButton: true,
      name: this.translateService.translate('actions.edit'),
    },
  ];

  formGroup: FormGroup = this.fb.group({
    tree: [[]]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    public peSimpleStepperService: PeSimpleStepperService,
    public headerService: PePlatformHeaderService,
    public translateService: TranslateService,
    public dataGridSidebarService: PeDataGridSidebarService
  ) {
    super();
    this.peSimpleStepperService.translateFunc = (line: string) => this.translateService.translate(line);
    this.peSimpleStepperService.hasTranslationFunc = (key: string) => this.translateService.hasTranslation(key);
  }

  ngOnInit() {
    this.storageService.getBusiness()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(business => {
        this.theme = business?.themeSettings?.theme && business?.themeSettings?.theme !== 'default' ? business.themeSettings.theme : 'dark';
      });
    this.headerService.assignConfig(
      {
        isShowDataGridToggleComponent: true,
        showDataGridToggleItem: {
          onClick: () => {
            this.toggleSidebar();
          }
        }
      } as PePlatformHeaderConfig
    );
    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          if (this.checkoutUuid !== 'create' && this.checkoutUuid !== this.currentCheckout?._id) {
            this.getCurrentCheckout();
          }
          this.setActiveFilterFromUrl(this.router.url);
          if (this.isMobile && this.rotedByNavMenu) {
            this.dataGridSidebarService.toggleFilters$.next();
            this.rotedByNavMenu = false;
          }
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.storageService.checkoutUpdate$.pipe(takeUntil(this.destroyed$)).subscribe(() => this.getCurrentCheckout());
    this.setActiveFilterFromUrl(this.router.url);

    this.formGroup.valueChanges.pipe(
      tap((formGroup) => {
        if (formGroup?.tree && formGroup?.tree[0] && formGroup?.tree[0].id !== this.activeRouteFilter?.id) {
          this.activeRouteFilter = formGroup?.tree[0];
          this.rotedByNavMenu = true;
          this.router.navigate(['..', 'checkout', this.currentCheckout._id, this.routes[this.activeRouteFilter?.id || 0]],
            {relativeTo: this.activatedRoute});
        }
      }),
      takeUntil(this.destroyed$)
    )
      .subscribe();

    this.dataGridSidebarService.toggleFilters$.pipe().subscribe(() => this.isSidebarShown = !this.isSidebarShown);

    if (this.isMobile) {
      this.dataGridSidebarService.toggleFilters$.next();
    }
  }

  ngAfterViewInit() {
    if (this.isMobile) {
      this.dataGridSidebarService.toggleFilters$.next();
    }
  }

  ngOnDestroy(): void {
    this.peSimpleStepperService.translateFunc = null;
    this.peSimpleStepperService.hasTranslationFunc = null;
  }

  get checkoutUuid(): string {
    return window.location.pathname.split('/')[4];
  }

  getFilterIcon(node: TreeFilterNode) {
    if (Number(node.id) > 0) {
      return this.icons[node.id];
    }
  }

  toggleSidebar() {
    this.dataGridSidebarService.toggleFilters$.next();
  }

  setActiveFilterFromUrl(url: string) {
    if (!this.activeRouteFilter || !url.includes(`/${this.routes[this.activeRouteFilter.id]}`)) {
      this.activeRouteFilter = this.treeData.find(filter => {
        return url.includes(`/${this.routes[filter.id]}`);
      });
      if (this.activatedRoute.snapshot.queryParams?.editCheckout === 'true') {
        this.activeRouteFilter = this.treeData[3];
      }
      if (this.activeRouteFilter) {
        if (this.formGroup) {
          this.formGroup.controls.tree.setValue([this.activeRouteFilter]);
          this.filterRef?.updateValue([this.activeRouteFilter]);
          this.cdr.detectChanges();
        } else {
          this.formGroup = this.fb.group({
            tree: [[this.activeRouteFilter]]
          });
        }
      } else {
        if (this.formGroup) {
          this.formGroup.controls.tree.setValue([]);
          this.filterRef?.updateValue([]);
        }
      }
    }
  }

  getCurrentCheckout() {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).pipe(
      take(1),
      tap(checkout => {
        this.currentCheckout = checkout;
        this.treeData[0].name = checkout.name || ' ';
      }),
    ).subscribe(() => {
    }, () => this.currentCheckout = null);
  }
}
