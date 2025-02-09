import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { debounceTime, filter, take, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

import { MessageBus } from '@pe/common';
import { PeDataGridSortByAction, PeDataGridSortByActionIcon } from '@pe/common';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { modalComponents, modalModules } from '../modals/configure/constants';

import { BaseListCommonComponent, ConnectWelcomeComponent, IntegrationInfoWithStatusInterface, SharedModule } from '../../../shared';
import { InstallIntegrationComponent } from '../install-integration/install-integration.component';
import { IntegrationInstalledComponent } from '../integration-installed/integration-installed.component';
import { IntegrationFullPageComponent } from '../integration-full-page/integration-full-page.component';
import { IntegrationAllReviewsComponent } from '../integration-all-reviews/integration-all-reviews.component';
import { IntegrationWriteReviewComponent } from '../integration-write-review/integration-write-review.component';
import { IntegrationVersionHistoryComponent } from '../integration-version-history/integration-version-history.component';

@Component({
  selector: 'connect-list-common',
  templateUrl: './list-common.component.html',
  styleUrls: ['./list-common.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListCommonComponent extends BaseListCommonComponent {

  dialogRef: PeOverlayRef;
  onActionSubject$ = new Subject<number>();
  onDataLoadSubject$ = new Subject<number>();

  sortByActions: PeDataGridSortByAction[] = [
    {
      label: this.translateService.translate('categories.payments.add_variant.form.name.label'),
      callback: () => {
        this.gridItems$.value.sort((a, b) => {
          return this.translateService.translate(a._cardItem.displayOptions.title).toLowerCase()
          > this.translateService.translate(b._cardItem.displayOptions.title).toLowerCase() ? 1 : -1;
        });
      },
      icon: PeDataGridSortByActionIcon.Name,
    }
  ];

  constructor(
    injector: Injector,
    protected overlayService: PeOverlayWidgetService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    try {
      // Sometimes getting this:
      //  core.js:6237 ERROR NullInjectorError: R3InjectorError(ConnectModule)[MessageBus -> MessageBus -> MessageBus -> ...]:
      //    NullInjectorError: No provider for MessageBus!
      const messageBus: MessageBus = this.injector.get(MessageBus);
      messageBus.listen('connect.toggle.sidebar').pipe(
        takeUntil(this.destroyed$), tap(() => {
          this.toggleSidebar();
          this.cdr.detectChanges();
        })
      ).subscribe();
    } catch (e) {}

    this.integrationsStateService.getUserBusinessesOnce().subscribe(business => {
      this.theme = business?.themeSettings?.theme && business?.themeSettings?.theme !== 'default'
        ? business.themeSettings.theme : 'dark';
      this.cdr.detectChanges();
    });

    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      if (
        this.route.snapshot?.queryParams
        && (this.route.snapshot?.queryParams?.modalType
        || (this.route.snapshot?.queryParams?.integration && this.route.snapshot?.queryParams?.integrationCategory))
      ) {
        this.gridItems$.asObservable().pipe(filter(d => !!d.length), take(1)).subscribe(data => this.initQueryParams());
      }
    });
  }

  handleOpen(integration: IntegrationInfoWithStatusInterface, isLoading: BehaviorSubject<boolean>): void {
    const data = {
      integrationName: integration.name,
      integrationCategory: integration.category
    };
    const title = this.translateService.translate(integration?.displayOptions?.title);
    const customConfig = {
      headerConfig: {
        title: title || integration?.displayOptions?.title,
        hideHeader: false
      }
    };
    if (integration._status
      && integration._status.installed
      && modalComponents[integration.category]
      && modalComponents[integration.category][integration.name]) {
      this.initModal(
        modalComponents[integration.category][integration.name],
        modalModules[integration.category],
        data,
        customConfig,
        isLoading);
    } else if (modalComponents[integration.category] && !modalComponents[integration.category][integration.name]) {
      this.initModal(
        modalComponents[integration.category].default,
        modalModules[integration.category],
        data,
        customConfig,
        isLoading);
    } else if (!modalComponents[integration.category]) {
      this.initModal(
        modalComponents.default,
        modalModules.default,
        data,
        customConfig,
        isLoading);
    }
  }

  private initQueryParams() {
    const modalType = this.route.snapshot.queryParams.modalType;
    const integrationName = this.route.snapshot.queryParams.integration;
    const integrationCategory = this.route.snapshot.queryParams.integrationCategory;
    this.integrationsStateService.getIntegration(integrationName).pipe(filter(d => !!d), take(1), takeUntil(this.destroyed$))
      .subscribe(integration => {

        const title = integration ? this.translateService.translate(integration.displayOptions.title) : integrationName;

        let module;
        let modalComponent;
        const customConfig = {
          headerConfig: {
            title: title,
            hideHeader: false
          },
          backdropClick: null,
          backdropClass: null
        };

        const gridIntegration = this.gridItems$?.value.find(int => int._cardItem.name === integration.name);
        if (gridIntegration) {
          // To update actions for item in list when uninstalled from TPM
          gridIntegration._cardItem._status.installed = integration._status.installed;
          gridIntegration.actions = this.getItemActions(gridIntegration._cardItem);
        }

        switch (modalType) {
          case 'welcome':
            modalComponent = ConnectWelcomeComponent;
            customConfig.headerConfig.hideHeader = true;
            customConfig.backdropClick = () => null;
            module = SharedModule;
            break;
          case 'install':
            modalComponent = InstallIntegrationComponent;
            module = SharedModule;
            break;
          case 'done':
            modalComponent = IntegrationInstalledComponent;
            customConfig.headerConfig.hideHeader = true;
            customConfig.backdropClass = 'connect-short-modal';
            module = SharedModule;
            break;
          case 'fullpage':
            modalComponent = IntegrationFullPageComponent;
            module = SharedModule;
            break;
          case 'reviews':
            modalComponent = IntegrationAllReviewsComponent;
            module = SharedModule;
            break;
          case 'write-review':
            modalComponent = IntegrationWriteReviewComponent;
            module = SharedModule;
            break;
          case 'version-history':
            modalComponent = IntegrationVersionHistoryComponent;
            module = SharedModule;
            break;
          default:
            if (!modalComponents[integrationCategory]) {
              modalComponent = modalComponents.default;
            } else {
              modalComponent = modalComponents[integrationCategory][integrationName]
                ? modalComponents[integrationCategory][integrationName]
                : modalComponents[integrationCategory].default;
            }
            module = modalModules[integrationCategory] || modalModules.default;
            break;
        }
        this.initModal(modalComponent, module, {integrationName, integrationCategory}, customConfig);
      });
  }

  private initModal(component, module, data = {}, customConfig: PeOverlayConfig = {}, isLoading: BehaviorSubject<boolean> = null) {
    this.onActionSubject$ = new Subject<number>();
    const config: PeOverlayConfig = {
      data: {
        theme: this.theme,
        onAction: this.onActionSubject$,
        onDataLoad: this.onDataLoadSubject$,
        ...data
      },
      hasBackdrop: true,
      backdropClass: customConfig.backdropClass || 'connect-modal',
      backdropClick: customConfig.backdropClick ? customConfig.backdropClick : null,
      headerConfig: {
        title: customConfig.headerConfig.title,
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('actions.done'),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
        theme: this.theme,
        hideHeader: customConfig.headerConfig.hideHeader,
        removeContentPadding: true
      },
      component: component,
      lazyLoadedModule: module
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed.subscribe(() => {
      if (isLoading && isLoading.value) {
        isLoading.next(false);
      }
      this.router.navigate([], {queryParams: {}});
    });
    this.onActionSubject$.asObservable().pipe(take(1)).subscribe(() => {
      this.dialogRef.close();
    });
    this.hideModal();
    this.onDataLoadSubject$.asObservable()
      .pipe(takeUntil(this.destroyed$), filter(d => !!d), debounceTime(300))
      .subscribe(() => {
      if (isLoading && isLoading.value) {
        isLoading.next(false);
      }
      this.showModal();
    });
  }

  private hideModal() {
    this.dialogRef.addPanelClass('hidden');
    this.dialogRef.getBackdropElement().style.backgroundColor = 'transparent';
  }

  private showModal() {
    this.dialogRef.removePanelClass('hidden');
    this.dialogRef.getBackdropElement().style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  }
}
