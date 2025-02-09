import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { BusinessTaxes } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';


import { openBusinessCurrency, settingsBusinessIdRouteParam } from '../../misc/constants';
import { BusinessInterface } from '../../misc/interfaces';
import {
  BusinessDetailsInterface,
  BusinessTrustedDomainsInterface,
} from '../../misc/interfaces/business-details.interface';
import { ApiService, BusinessEnvService } from '../../services';

import {
  EditAddressComponent,
  EditBankComponent,
  EditCompanyComponent,
  EditContactComponent,
  EditCurrencyComponent,
  EditTaxesComponent,
  EditTransactionRetentionSettingComponent,
  EditWhitelistComponent,
} from './components';


@Component({
  selector: 'peb-business-detail',
  templateUrl: './business-detail.component.html',
  styleUrls: ['./business-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class BusinessDetailComponent implements OnInit {

  businessId: string;
  business: BusinessInterface;
  dialogRef: PeOverlayRef;

  businessDetailsList = [{
    logo: '#icon-settings-currency',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.currency.title'),
    isActive: false,
    action: (e, detail) => {
      detail.isActive = true;
      forkJoin([
        this.apiService.getCurrencyList(),
        this.getBusinessDetails(),
      ]).pipe(
        tap(([currenciesList, details]) => {
          this.openModal(
            this.getObjectForModal(
              detail,
              EditCurrencyComponent,
              { currencies: currenciesList, business: cloneDeep(this.business), details },
            ),
          );
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    },
  },
  {
    logo: '#icon-settings-company',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.company.title'),
    isActive: false,
    action: (e, detail) => {
      detail.isActive = true;
      this.getBusinessDetails().pipe(
        tap((details) => {
          this.openModal(
            this.getObjectForModal(detail, EditCompanyComponent, { business: cloneDeep(this.business), details }),
          );
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    },
  },
  {
    logo: '#icon-settings-contact',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.contact.title'),
    isActive: false,
    action: (e, detail) => {
      detail.isActive = true;
      this.getBusinessDetails().pipe(
        tap((details) => {
          this.openModal(
            this.getObjectForModal(detail, EditContactComponent, { business: cloneDeep(this.business), details }),
          );
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    },
  },
  {
    logo: '#icon-settings-address',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.address.title'),
    isActive: false,
    action: (e, detail) => {
      detail.isActive = true;
      this.getBusinessDetails().pipe(
        tap((details) => {
          this.openModal(
            this.getObjectForModal(detail, EditAddressComponent, { business: cloneDeep(this.business), details }),
          );
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    },
  },
  {
    logo: '#icon-settings-bank',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.bank.title'),
    isActive: false,
    action: (e, detail) => {
      detail.isActive = true;
      this.getBusinessDetails().pipe(
        tap((details) => {
          this.openModal(
            this.getObjectForModal(detail, EditBankComponent, { business: cloneDeep(this.business), details }),
          );
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    },
  },
  {
    logo: '#icon-settings-taxes',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.taxes.title'),
    isActive: false,
    action: (e, detail) => {
      detail.isActive = true;
      this.getTaxes().pipe(
        tap((taxes) => {
          this.openModal(
            this.getObjectForModal(detail, EditTaxesComponent, { business: { ...cloneDeep(this.business), taxes } }),
          );
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    },
  },
  {
    logo: '#icon-settings-whitelist',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.whitelist.title'),
    isActive: false,
    action: (e, detail) => {
      detail.isActive = true;
      this.getTrustedDomains().pipe(
        tap((domains) => {
          this.openModal(
            this.getObjectForModal(detail, EditWhitelistComponent, { domains }),
          );
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    },
  },
  {
    logo: '#icon-settings-archive',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.archive.title'),
    isActive: false,
    action: (e, detail) => {
      detail.isActive = true;
      this.openModal(this.getObjectForModal(detail, EditTransactionRetentionSettingComponent));
    },
  },
];

  listDataSubject = new BehaviorSubject(this.businessDetailsList);

  resetHighlighted() {
    this.businessDetailsList.forEach((item) => {
      item.isActive = false;
    });
    this.listDataSubject.next(this.businessDetailsList);
  }

  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private businessEnvService: BusinessEnvService,
    private overlayService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private confirmScreenService: ConfirmScreenService,
    private readonly destroyed$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    this.businessId = this.activatedRoute.parent.parent.parent.snapshot.params[settingsBusinessIdRouteParam]
      || this.activatedRoute.parent.snapshot.params['slug'];
    this.business = this.businessEnvService.businessData;

    this.activatedRoute.params.pipe(
      filter(res => res.modal === openBusinessCurrency),
      switchMap(() => this.apiService.getCurrencyList()),
      filter(currencyList => !!currencyList),
      tap(currencyList => this.openModal(
        this.getObjectForModal(
          {
            name: this.translateService.translate('info_boxes.panels.business_details.menu_list.currency.title'),
          },
          EditCurrencyComponent,
          { currencies: currencyList, business: this.business }),
      )),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  getBusinessDetails(): Observable<BusinessDetailsInterface> {
    return this.apiService.getBusinessDetails(this.businessId);
  }

  private getTransactionsRetentionSetting() {
    return this.apiService.getTransactionsRetentionSetting(this.businessId);
  }

  getTaxes(): Observable<BusinessTaxes> {
    return this.apiService.getBusinessTaxes(this.businessId);
  }

  getTrustedDomains(): Observable<BusinessTrustedDomainsInterface[]> {
    return this.apiService.getBusinessTrustedDomains(this.businessId);
  }

  openModal(data) {

    const config: PeOverlayConfig = {
      data: { data: data.data },
      headerConfig: {
        title: data.name,
        backBtnTitle: this.translateService.translate('dialogs.new_employee.buttons.cancel'),
        backBtnCallback: () => {
          this.showConfirmationDialog();
        },
        doneBtnTitle: this.translateService.translate('actions.save'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
      },
      backdropClick: () => {
        this.showConfirmationDialog();
      },
      component: data.component,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed.pipe(
      switchMap((res) => {
        this.resetHighlighted();
        if (res?.data) {
          if (res.data?.currentWallpaper?.wallpaper) {
            const wallpaperUrl = res.data.currentWallpaper.wallpaper;
            res.data.currentWallpaper.wallpaper = wallpaperUrl.substring(wallpaperUrl.lastIndexOf('/') + 1);
          }

          return this.apiService.updateBusinessData(this.businessId, res.data).pipe(
            tap((updatedBusiness) => {
              this.business = updatedBusiness;
              this.cdr.detectChanges();
            }),
          );
        }

        return of(null);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  getObjectForModal(detail, component, data = null) {
    return {
      component,
      data,
      name: detail.itemName,
    };
  }

  private showConfirmationDialog() {
    const headings: Headings = {
      title: this.translateService.translate('dialogs.window_exit.title'),
      subtitle: this.translateService.translate('dialogs.window_exit.label'),
      declineBtnText: this.translateService.translate('dialogs.window_exit.decline'),
      confirmBtnText: this.translateService.translate('dialogs.window_exit.confirm'),
    };

    this.confirmScreenService.show(headings, true).pipe(
      tap((val) => {
        if (val) {
          this.dialogRef.close();
          this.resetHighlighted();
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

}
