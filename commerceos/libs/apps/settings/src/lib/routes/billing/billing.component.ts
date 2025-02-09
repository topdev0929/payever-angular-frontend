import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { BehaviorSubject, merge } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { openBusinessCurrency, settingsBusinessIdRouteParam } from '../../misc/constants';
import { BusinessInterface } from '../../misc/interfaces';
import { ApiService, BusinessEnvService } from '../../services';
import { EditCurrencyComponent } from '../business-detail/components';

@Component({
  selector: 'pe-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class BillingComponent implements OnInit {

  businessId: string;
  business: BusinessInterface;
  dialogRef: PeOverlayRef;
  businessDetailsList = [{
    logo: '#icon-settings-company',
    itemName: this.translateService.translate('info_boxes.panels.business_details.menu_list.subscription.title'),
    action: (e, detail) => {
      this.snackbarService.toggle(true, {
              content: this.translateService.translate('info_boxes.panels.business_details.menu_list.subscription.error'),
              duration: 5000,
              iconColor: '#E2BB0B',
              iconId: 'icon-alert-24',
              iconSize: 24,
            });
    },
  }];

  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private businessEnvService: BusinessEnvService,
    private overlayService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private destroy$: PeDestroyService,
private snackbarService: SnackbarService,
  ) {
  }

  ngOnInit(): void {
    this.businessId = this.activatedRoute.parent.snapshot.params[settingsBusinessIdRouteParam]
      || this.activatedRoute.parent.snapshot.params['slug'];

    merge(
      this.activatedRoute.data.pipe(
        tap((data: Data) => {
          this.business = data['business'];
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$),
      ),
      this.activatedRoute.params.pipe(
        filter(res => res.modal === openBusinessCurrency),
        switchMap((res) => {
          return this.apiService.getCurrencyList().pipe(
            tap((currencyList) => {
              this.openModal(
                this.getObjectForModal(
                  {
                    name: this.translateService
                      .translate('info_boxes.panels.business_details.menu_list.currency.title'),
                  },
                  EditCurrencyComponent,
                  { currencies: currencyList, business: this.business }),
              );
            }),
          );
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
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
      }),
      takeUntil(this.destroy$),
    )
      .subscribe();
  }

  getObjectForModal(detail, component, data = null) {
    return {
      component,
      data,
      name: detail.itemName,
    };
  }

  private showConfirmationDialog() {
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      panelClass: ['settings-dialog'],
      data: {
        title: this.translateService.translate('dialogs.window_exit.title'),
        subtitle: this.translateService.translate('dialogs.window_exit.label'),
        cancelButtonTitle: this.translateService.translate('dialogs.window_exit.decline'),
        confirmButtonTitle: this.translateService.translate('dialogs.window_exit.confirm'),
      },
      hasBackdrop: false,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.dialogRef.close();
        }
        this.router.navigate(['.'], { relativeTo: this.activatedRoute });
      });
  }

}
