import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { AppThemeEnum, EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { BehaviorSubject } from 'rxjs';
import { filter, pluck, takeUntil, tap } from 'rxjs/operators';
import { AbstractComponent } from '../../components/abstract';
import { CloseWindowsConfirmationComponent } from '../../components/dialogs/exit-confirm/exit-confirm.component';
import { EditAddressComponent } from '../../components/edit-address/edit-address.component';
import { EditBankComponent } from '../../components/edit-bank/edit-bank.component';
import { EditCompanyComponent } from '../../components/edit-company/edit-company.component';
import { EditContactComponent } from '../../components/edit-contact/edit-contact.component';
import { EditCurrencyComponent } from '../../components/edit-currency/edit-currency.component';
import { EditTaxesComponent } from '../../components/edit-taxes/edit-taxes.component';
import { closeConfirmationQueryParam, openBusinessCurrency, settingsBusinessIdRouteParam } from '../../misc/constants';
import { BusinessInterface } from '../../misc/interfaces';
import { BusinessDetailsInterface } from '../../misc/interfaces/business-details.interface';
import { ApiService, BusinessEnvService } from '../../services';

@Component({
  selector: 'peb-business-detail',
  templateUrl: './business-detail.component.html',
  styleUrls: ['./business-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessDetailComponent extends AbstractComponent implements OnInit {
  theme = this.businessEnvService.businessData$?.themeSettings?.theme
    ? AppThemeEnum[this.businessEnvService.businessData$?.themeSettings?.theme]
    : AppThemeEnum.default;
  businessId: string;
  business: BusinessInterface;
  businessDetails: BusinessDetailsInterface;
  currenciesList = [];
  dialogRef: PeOverlayRef;
  businessDetailsList = [{
    logo: '#icon-settings-currency',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.currency.title'),
    action: (e, detail) => {
      this.apiService.getCurrencyList().subscribe(currenciesList => {
        this.openModal(
          this.getObjectForModal(detail, EditCurrencyComponent, { currencies: currenciesList, business: this.business}),
        );
      });
    },
  }, {
    logo: '#icon-settings-company',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.company.title'),
    action: (e, detail) => {
      this.getBusinessDetails().subscribe(details => {
        this.openModal(
          this.getObjectForModal(detail, EditCompanyComponent, { business: this.business, details }),
        );
      });
    },
  }, {
    logo: '#icon-settings-contact',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.contact.title'),
    action: (e, detail) => {
      this.getBusinessDetails().subscribe(details => {
        this.openModal(
          this.getObjectForModal(detail, EditContactComponent, {business: this.business, details}),
        );
      });
    },
  }, {
    logo: '#icon-settings-address',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.address.title'),
    action: (e, detail) => {
      this.getBusinessDetails().subscribe(details => {
        this.openModal(
          this.getObjectForModal(detail, EditAddressComponent, {business: this.business, details}),
        );
      });
    },
  }, {
    logo: '#icon-settings-bank',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.bank.title'),
    action: (e, detail) => {
      this.getBusinessDetails().subscribe(details => {
        this.openModal(
          this.getObjectForModal(detail, EditBankComponent, {business: this.business, details}),
        );
      });
    },
  }, {
    logo: '#icon-settings-taxes',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.taxes.title'),
    action: (e, detail) => {
      this.getTaxes().subscribe(taxes => {
        this.business['taxes'] = taxes;
        this.openModal(
          this.getObjectForModal(detail, EditTaxesComponent, {business: this.business}),
        );
      });
    },
  }];

  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private envService: EnvService,
    private businessEnvService: BusinessEnvService,
    private overlayService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    this.businessId = this.activatedRoute.parent.snapshot.params[settingsBusinessIdRouteParam]
      || this.activatedRoute.parent.snapshot.params['slug'];

    this.activatedRoute.data
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: Data) => {
        this.business = data['business'];
        this.cdr.detectChanges();
      });

    this.activatedRoute.queryParams.pipe(
      pluck(closeConfirmationQueryParam),
      filter(showDialog => !!showDialog),
      takeUntil(this.destroyed$),
    ).subscribe( () => {
      this.showConfirmationDialog();
    });

    this.activatedRoute.params.pipe(
      takeUntil(this.destroyed$),
    ).subscribe(
      res => {
        if (res.modal === openBusinessCurrency) {
          this.business = this.businessEnvService.businessData$;
          this.apiService.getCurrencyList().subscribe(currencyList => {
            this.openModal(
              this.getObjectForModal(
                {name: this.translateService.translate('info_boxes.panels.business_details.menu_list.currency.title')},
                EditCurrencyComponent,
                { currencies: currencyList, business: this.business}),
            );
          });
        }
      });
  }

  getBusiness() {
    return this.apiService.getBusiness(this.businessId).pipe(takeUntil(this.destroyed$));
  }

  getBusinessDetails() {
    return this.apiService.getBusinessDetails(this.businessId).pipe(takeUntil(this.destroyed$));
  }

  getTaxes() {
    return this.apiService.getBusinessTaxes(this.businessId).pipe(takeUntil(this.destroyed$));
  }

  openModal(data) {
    const config: PeOverlayConfig = {
      data: { data: data.data },
      headerConfig: {
        title: data.name,
        backBtnTitle: this.translateService.translate('dialogs.new_employee.buttons.cancel'),
        backBtnCallback: () => {
          this.onCloseWindow();
        },
        doneBtnTitle: this.translateService.translate('actions.save'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      backdropClick: () => {
        this.onCloseWindow();
      },
      component: data.component,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        tap((res) => {
          if (res?.data) {
            if (res.data?.currentWallpaper) {
              const wallpaperUrl = res.data?.currentWallpaper.wallpaper;
              res.data.currentWallpaper.wallpaper = wallpaperUrl.substring(wallpaperUrl.lastIndexOf('/') + 1);
            }
            this.apiService
              .updateBusinessData(this.businessId, res.data)
              .pipe(
                takeUntil(this.destroyed$),
              )
              .subscribe(
                (updatedBusiness) => {
                  this.business = updatedBusiness;
                  this.cdr.detectChanges();
                },
              );

            this.cdr.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  getObjectForModal(detail, component, data = null) {
    return  {
      component,
      data,
      name: detail.itemName,
    };
  }

  private showConfirmationDialog() {
    const dialogRef = this.dialog.open(CloseWindowsConfirmationComponent, {
      panelClass: [ 'settings-dialog', this.theme],
      data: this.businessId,
      hasBackdrop: false,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        if (result.exit) {
          this.dialogRef.close();
        }
        this.router.navigate(['.'], {relativeTo: this.activatedRoute});
      });
  }

  onCloseWindow() {
    const queryParams = {};
    queryParams[closeConfirmationQueryParam] = true;
    this.router.navigate([], {queryParams, relativeTo: this.activatedRoute});
  }

}
