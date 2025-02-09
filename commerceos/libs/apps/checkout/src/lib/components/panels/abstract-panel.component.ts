import { Injector, Input, OnInit, Compiler, Directive, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { PeDestroyService, NavigationService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { IntegrationCategory } from '@pe/shared/checkout';

import {
  CheckoutInterface,
  CustomChannelTypeEnum,
  IntegrationInfoInterface,
} from '../../interfaces';
import { RootCheckoutWrapperService, StorageService, ApiService } from '../../services';


@Directive({
  providers: [
    PeDestroyService,
  ],
})
export abstract class AbstractPanelComponent implements OnInit {

  @Input() onlyContent = false;

  loadingConnect = new BehaviorSubject(false);

  // Marketing list can be too huge this is why we don't show
  readonly disabledChannels: CustomChannelTypeEnum[] = [
    // CustomChannelTypeEnum.Marketing
  ];

  readonly channelsExtraConfigure: CustomChannelTypeEnum[] = [
    CustomChannelTypeEnum.Pos,
    CustomChannelTypeEnum.Shop,
    CustomChannelTypeEnum.Marketing,
    CustomChannelTypeEnum.QR,
  ];

  categories = IntegrationCategory;
  initHeaderSub: Subscription;
  currentCheckoutSub: Subscription;
  enabledIntegrationsSub: Subscription;
  currentCheckout$: BehaviorSubject<CheckoutInterface> = new BehaviorSubject(null);
  $enabledIntegrations: BehaviorSubject<string[]> = new BehaviorSubject([]);

  protected activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected compiler: Compiler = this.injector.get(Compiler);
  protected router: Router = this.injector.get(Router);
  protected apiService: ApiService = this.injector.get(ApiService);
  protected storageService: StorageService = this.injector.get(StorageService);
  protected wrapperService: RootCheckoutWrapperService = this.injector.get(RootCheckoutWrapperService);
  protected translateService: TranslateService = this.injector.get(TranslateService);
  protected navigationService: NavigationService = this.injector.get(NavigationService);
  private cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected destroy$: PeDestroyService = this.injector.get(PeDestroyService);

  constructor(
    protected injector: Injector,
  ) {
    this.initCurrentCheckout(this.checkoutUuid);
  }

  ngOnInit(): void {
    let lastCheckoutUuid = this.checkoutUuid;
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event: Event) => {
      if (event instanceof NavigationEnd && lastCheckoutUuid !== this.checkoutUuid) {
        lastCheckoutUuid = this.checkoutUuid;
        this.initCurrentCheckout(this.checkoutUuid);
      }
    });
    this.storageService.checkoutUpdate$.pipe(takeUntil(this.destroy$)).subscribe(() =>
    this.initCurrentCheckout(this.checkoutUuid));
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  initCurrentCheckout(checkoutUuid: string): void {
    if (this.currentCheckoutSub) {
      this.currentCheckoutSub.unsubscribe();
    }
    if (this.enabledIntegrationsSub) {
      this.enabledIntegrationsSub.unsubscribe();
    }

    this.currentCheckoutSub = this.storageService.getCheckoutById(this.checkoutUuid).pipe(
      takeUntil(this.destroy$),
      filter(d => !!d)
    ).subscribe((current) => {
      this.currentCheckout$.next(current);
      this.cdr.markForCheck();
      this.enabledIntegrationsSub = this.storageService.getCheckoutEnabledIntegrations(current._id).pipe(
        takeUntil(this.destroy$),
        filter(d => !!d)
      ).subscribe((enabledList) => {
        this.$enabledIntegrations.next(enabledList);
        this.cdr.markForCheck();
      });
    });
  }

  onToggleIntegration(integration: IntegrationInfoInterface) {
    const integrationName = integration.integration.name;

    this.$enabledIntegrations.pipe(
      takeUntil(this.destroy$),
      filter(d => !!d),
      take(1)
    ).subscribe((names) => {
      const updatedNames = names.includes(integrationName) ?
        names.filter(name => name !== integrationName) : [...names, integrationName];
      this.$enabledIntegrations.next(updatedNames);

      this.storageService.toggleCheckoutIntegration(
        this.checkoutUuid,
        integrationName,
        names.indexOf(integrationName) < 0
      ).subscribe(() => {
        this.onUpdateData();
      }, () => {
        this.$enabledIntegrations.next(names);
      });
    });
  }

  onUpdateData(): void {
    this.wrapperService.onSettingsUpdated();
  }

  clickedIntegrationOpenButton(integration: IntegrationInfoInterface): void {
    if (this.channelsExtraConfigure.indexOf(integration.integration.name as CustomChannelTypeEnum) >= 0) {
      // For qr, pos, etc. At Connect tab
      const channelRoute: string[] = [
        `business/${this.storageService.businessUuid}/checkout/` +
        `'${this.checkoutUuid}/channels/${integration.integration.name}-app`,
      ];
      this.router.navigate(channelRoute);
    } else if (this.disabledChannels.indexOf(integration.integration.name as CustomChannelTypeEnum) >= 0) {
      console.warn('This intergration is disabled:', integration.integration.name);
    } else {
      this.router.navigate([
        `/business/${this.storageService.businessUuid}/checkout/` +
        `${this.checkoutUuid}/connect-app-edit/${integration.integration.category}/${integration.integration.name}`,
      ]);
    }
  }

  clickedIntegrationAddButton(category: IntegrationCategory): void {
    this.loadingConnect.next(true);
    this.cdr.detectChanges();
    this.navigationService.saveReturn(this.router.url);
      this.router.navigate([
        `/business/${this.storageService.businessUuid}/connect`,
      ], { queryParams: { integrationName: category } });
  }
}
