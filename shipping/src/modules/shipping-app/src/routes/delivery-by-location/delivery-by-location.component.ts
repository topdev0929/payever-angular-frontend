import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { BehaviorSubject } from 'rxjs';
import { catchError, take, takeUntil, tap } from 'rxjs/operators';
import { DistanceMeasurementUnitsEnum } from '../../enums/DistanceMeasurementUnitsEnum';
import { AbstractComponent } from '../../misc/abstract.component';
import { PebShippingBusinessService } from '../../services/business-shipping.service';
import { PebShippingOriginService } from '../../services/shipping-origin.service';
import { PebShippingSettingsService } from '../../services/shipping-settings.service';
import { LibShippingEditLocationModalComponent } from './edit-location-modal/edit-location-modal.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AppThemeEnum, MessageBus, EnvService } from '@pe/common';
import { ConfirmDialogService } from '../shipping-profiles/browse-products/dialogs/dialog-data.service';

@Component({
  selector: 'peb-delivery-by-location',
  templateUrl: './delivery-by-location.component.html',
  styleUrls: ['./delivery-by-location.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebDeliveryByLocationComponent extends AbstractComponent implements OnInit {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  settings;
  currency;

  localDeliveryForm: FormGroup = this.formBuilder.group({
    shippingOrigin: [],
    hasLocalDelivery: [{ value: false, disabled: true }],
    deliveryArea: ['postal_code'],
    usePostalCodes: [false],
    radiusMeasurementUnit: [DistanceMeasurementUnitsEnum.KILOMETERS],
    conditionalDeliveryPricing: [false],
    // deliveryRadius: [],
    postalCodes: [],
    // minOrderPrice: [],
    // deliveryPrice: [],
    // deliveryMessage: [''],
  });

  distanceMeasurementUnits = [
    { label: 'kilometers', value: DistanceMeasurementUnitsEnum.KILOMETERS },
    { label: 'miles', value: DistanceMeasurementUnitsEnum.MILES },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private messageBus: MessageBus,
    private shippingSettingsService: PebShippingSettingsService,
    private shippingOriginService: PebShippingOriginService,
    private shippingBussinessService: PebShippingBusinessService,
    private overlayService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private envService: EnvService,
    protected translateService: TranslateService,
    private confirmDialog: ConfirmDialogService,
  ) {
    super(translateService);
    this.matIconRegistry.addSvgIcon(
      `shipping-location-icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/shipping-location-icon.svg'),
    );
  }
  ngOnInit(): void {
    this.getSettings();

    // this.localDeliveryForm.get('deliveryArea').valueChanges.subscribe((area) => {
    //   if (area === 'postal_code') {
    //     this.localDeliveryForm.get('deliveryRadius').reset();
    //     this.localDeliveryForm.get('minOrderPrice').reset();
    //     this.localDeliveryForm.get('deliveryPrice').reset();
    //     this.localDeliveryForm.get('deliveryMessage').reset();
    //   }
    //   if (area === 'radius') {
    //     this.localDeliveryForm.get('postalCodes').reset();
    //     this.localDeliveryForm.get('minOrderPrice').reset();
    //     this.localDeliveryForm.get('deliveryPrice').reset();
    //     this.localDeliveryForm.get('deliveryMessage').reset();
    //   }
    // });

    this.localDeliveryForm.get('shippingOrigin').valueChanges.subscribe((value) => {
      if (value) {
        this.localDeliveryForm.get('hasLocalDelivery').enable();
        this.localDeliveryForm.get('postalCodes').valueChanges.subscribe((code) => {
          if (code?.length > 0) {
            if (code[code.length - 1].includes(',')) {
              code[code.length - 1].split(/[ ,]+/).forEach((val) => {
                if (val && !code.find(c => val === c) && val.match(/^[0-9]+$/)) {
                  code.push(val);
                }
              });
              code.splice(code.indexOf(code.find(val => val.includes(','))), 1);
            } else if (!code[code.length - 1].match(/^[0-9]+$/)) {
              code.splice(code.indexOf([code.length - 1]), 1);
            }
          }
          this.updateLocalDelivery();
        });
      }
    });

    this.localDeliveryForm.get('hasLocalDelivery').valueChanges.subscribe((value) => {
      if (!value) {
        this.localDeliveryForm.get('postalCodes').patchValue(null);
      }
    });

    this.cdr.detectChanges();
  }

  updateLocalDelivery() {
    const shippingOrigin = this.localDeliveryForm.get('shippingOrigin').value;

    const payload = {
      name: shippingOrigin.name,
      streetName: shippingOrigin.streetName,
      streetNumber: shippingOrigin.streetNumber,
      city: shippingOrigin.city,
      zipCode: shippingOrigin.zipCode,
      countryCode: shippingOrigin.countryCode,
      phone: shippingOrigin.phone,
      localDelivery: {
        // deliveryRadius: this.localDeliveryForm.get('deliveryRadius').value,
        postalCodes: this.localDeliveryForm.get('postalCodes').value ? this.localDeliveryForm.get('postalCodes').value : [],
        // minOrderPrice: this.localDeliveryForm.get('minOrderPrice').value,
        // deliveryPrice: this.localDeliveryForm.get('deliveryPrice').value,
        // deliveryMessage: this.localDeliveryForm.get('deliveryMessage').value,
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
        const origin = response.filter((origin) => origin.isDefault === true)[0]?.origins[0];

        if (origin?._id) {
          this.shippingOriginService.getOriginById(origin._id).subscribe((response: any) => {
            origin.phone = origin.phone.split(' ')[1] ?? origin.phone;
            this.localDeliveryForm.get('shippingOrigin').patchValue(origin);
            if (response.localDelivery) {
              const localDelivery = response.localDelivery;
              const controls = this.localDeliveryForm.controls;

              // controls.deliveryRadius.patchValue(localDelivery.deliveryRadius);
              // controls.minOrderPrice.patchValue(localDelivery.minOrderPrice);
              // controls.deliveryPrice.patchValue(localDelivery.deliveryPrice);
              // controls.deliveryMessage.patchValue(localDelivery.deliveryMessage);
              if (localDelivery?.postalCodes?.length !== 0) {
                this.localDeliveryForm.get('hasLocalDelivery').patchValue(true);
                controls.postalCodes.patchValue(localDelivery.postalCodes);
                controls.deliveryArea.patchValue('postal_code');
              }
            }

            this.cdr.detectChanges();
          });
        }
        this.cdr.detectChanges();
      }
    });
  }

  // toggleAdditionalPricing() {
  //   const control = this.localDeliveryForm.controls;
  //   control.conditionalDeliveryPricing.setValue(!control.conditionalDeliveryPricing.value);
  //   control.conditionalDeliveryPricing.updateValueAndValidity();
  //
  //   if (control.additionalPricing.value && !control.conditionalDeliveryPricing.value) {
  //     control.additionalPricing.setValue('');
  //     control.additionalPricing.updateValueAndValidity();
  //   } else if (control.deliveryPrice.value && control.conditionalDeliveryPricing.value) {
  //     control.deliveryPrice.setValue('');
  //     control.deliveryPrice.updateValueAndValidity();
  //   }
  //
  //   control.minOrderPrice.setValue(+control.minOrderPrice.value);
  //   control.minOrderPrice.updateValueAndValidity();
  // }

  openEditLocationModal() {
    const isEdit = this.localDeliveryForm.get('shippingOrigin').value;
    const config: PeOverlayConfig = {
      data: {
        data: this.localDeliveryForm.get('shippingOrigin').value,
      },
      headerConfig: {
        title: this.translateService.translate('shipping-app.actions.edit_location'),
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('location', isEdit ? 'editing' : 'adding'));
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('zone', isEdit ? 'editing' : 'adding'));
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
