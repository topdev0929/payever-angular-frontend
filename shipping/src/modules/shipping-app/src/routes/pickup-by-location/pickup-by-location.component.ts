import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil, tap, catchError, take } from 'rxjs/operators';
import { AbstractComponent } from '../../misc/abstract.component';
import { LibShippingEditLocationModalComponent } from '../delivery-by-location/edit-location-modal/edit-location-modal.component';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService, PeOverlayConfig, PeOverlayRef } from '@pe/overlay-widget';
import { BehaviorSubject } from 'rxjs';
import { PebShippingSettingsService } from '../../services/shipping-settings.service';
import { PebShippingOriginService } from '../../services/shipping-origin.service';
import { PickupTimeEnums } from '../../enums/PickupTimeEnums';
import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PebShippingBusinessService } from '../../services/business-shipping.service';
import { ConfirmDialogService } from '../shipping-profiles/browse-products/dialogs/dialog-data.service';

@Component({
  selector: 'peb-pickup-by-location',
  templateUrl: './pickup-by-location.component.html',
  styleUrls: ['./pickup-by-location.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPickupByLocationComponent extends AbstractComponent implements OnInit {
  currency;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  localPickupForm: FormGroup = this.formBuilder.group({
    shippingOrigin: [],
    pickUpTime: [],
    pickUpMessage: [''],
    hasLocalPickup: [{ value: false, disabled: true }],
  });

  pickUpTimes = [
    { label: 'Usually ready in 1 hour', value: PickupTimeEnums.ReadyInOneHour },
    { label: 'Usually ready in 2 hours', value: PickupTimeEnums.ReadyInTwoHours },
    { label: 'Usually ready in 4 hours', value: PickupTimeEnums.ReadyInFourHours },
    { label: 'Usually ready in 24 hours', value: PickupTimeEnums.ReadyInTwentyFourHours },
    { label: 'Usually ready in 2-4 days', value: PickupTimeEnums.ReadyInTwoToFourDays },
    { label: 'Usually ready in 5+ days', value: PickupTimeEnums.ReadyInMoreThanFiveDays },
  ];
  constructor(
    private formBuilder: FormBuilder,
    private shippingSettingsService: PebShippingSettingsService,
    private shippingOriginService: PebShippingOriginService,
    private shippingBussinessService: PebShippingBusinessService,
    private overlayService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private envService: EnvService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private messageBus: MessageBus,
    private confirmDialog: ConfirmDialogService,
    protected translateService: TranslateService,
  ) {
    super(translateService);
    this.matIconRegistry.addSvgIcon(
      `shipping-location-icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/shipping-location-icon.svg'),
    );
  }

  ngOnInit() {
    this.getSettings();

    this.localPickupForm.get('shippingOrigin').valueChanges.subscribe((value) => {
      if (value) {
        this.localPickupForm.get('hasLocalPickup').enable();
        this.localPickupForm.get('pickUpTime').valueChanges.subscribe((val) => {
          this.updateLocalDelivery();
        });
      }
    });

    this.localPickupForm.get('hasLocalPickup').valueChanges.subscribe((value) => {
      if (!value) {
        this.localPickupForm.get('pickUpTime').patchValue(null);
        this.localPickupForm.get('pickUpMessage').patchValue('');
      } else {
        if (!this.localPickupForm.get('pickUpTime').value) {
          this.localPickupForm.get('pickUpTime').patchValue(PickupTimeEnums.ReadyInOneHour);
        }
      }
    });

    this.cdr.detectChanges();
  }

  updateLocalDelivery() {
    const shippingOrigin = this.localPickupForm.get('shippingOrigin').value;

    const payload = {
      name: shippingOrigin.name,
      streetName: shippingOrigin.streetName,
      streetNumber: shippingOrigin.streetNumber,
      city: shippingOrigin.city,
      zipCode: shippingOrigin.zipCode,
      countryCode: shippingOrigin.countryCode,
      phone: shippingOrigin.phone,
      localPickUp: {
        pickUpTime: this.localPickupForm.get('pickUpTime').value,
        pickUpMessage: this.localPickupForm.get('pickUpMessage').value,
      },
    };
    this.shippingOriginService.editOrigin(shippingOrigin._id, payload).subscribe();
  }

  getSettings() {
    this.shippingBussinessService.getShippingSettings().subscribe((responese: any) => {
      this.currency = responese.currency;
      this.cdr.detectChanges();
    });
    this.shippingSettingsService.getSettings().subscribe((response: any) => {
      if (response) {
        const origin = response.filter((origin) => origin?.isDefault === true)[0]?.origins[0];

        if (origin?._id) {
          this.shippingOriginService.getOriginById(origin._id).subscribe((response: any) => {
            origin.phone = origin.phone.split(' ')[1] ?? origin.phone;
            this.localPickupForm.get('shippingOrigin').patchValue(origin);
            if (response.localPickUp) {
              const localPickup = response?.localPickUp;
              const controls = this.localPickupForm.controls;

              if (localPickup?.pickUpTime) {
                this.localPickupForm.get('hasLocalPickup').patchValue(true);
              }

              controls.pickUpTime.patchValue(localPickup?.pickUpTime, { emitEvent: false });
              controls.pickUpMessage.patchValue(localPickup?.pickUpMessage);
            }

            this.cdr.detectChanges();
          });
          this.cdr.detectChanges();
        }
      }
    });
  }

  openEditLocationModal() {
    const isEdit = this.localPickupForm.get('shippingOrigin').value;
    const config: PeOverlayConfig = {
      data: { data: this.localPickupForm.get('shippingOrigin').value },
      headerConfig: {
        title: this.translateService.translate(isEdit ? 'shipping-app.actions.edit_location' : 'shipping-app.actions.add_location'),
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('location', isEdit ? 'editing' : 'adding'));
        },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      component: LibShippingEditLocationModalComponent,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        tap((data) => {
          if (data) {
            if (data?.id) {
              this.shippingOriginService
                .editOrigin(data.id, data.data)
                .pipe(
                  tap((_) => {
                    this.getSettings();
                    this.cdr.detectChanges();
                  }),
                  catchError((err) => {
                    throw new Error(err);
                  }),
                )
                .subscribe();
            } else {
              this.shippingOriginService
                .postOrigin(data.data)
                .pipe(
                  tap((_) => {
                    this.getSettings();
                    this.cdr.detectChanges();
                  }),
                  catchError((err) => {
                    throw new Error(err);
                  }),
                )
                .subscribe();
            }

            this.cdr.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  nagivateToCurrency() {
    this.messageBus.emit('setting.currency.open', null);
  }

  showConfirmationWindow(dialogContent) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
    ).subscribe(() => {
      this.dialogRef.close();
    });
  }
}
