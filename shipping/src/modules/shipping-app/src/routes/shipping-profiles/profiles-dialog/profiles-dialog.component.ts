import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ChangeDetectorRef,
  ViewEncapsulation,
  ViewChild, AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { AbstractComponent } from '../../../misc/abstract.component';
import {
  PeOverlayRef,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayWidgetService,
  PeOverlayConfig,
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
} from '@pe/overlay-widget';
import { skip, tap, takeUntil, catchError, take } from 'rxjs/operators';
import { PebBrowseProductsFormComponent } from '../browse-products/browse-products.component';
import { PebShippingEditOptionsComponent } from '../../shipping-options/edit-options-modal/edit-options.component';
import { PebShippingModule } from '../../../shipping.module';
import { LibShippingEditLocationModalComponent } from '../../delivery-by-location/edit-location-modal/edit-location-modal.component';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { PebShippingZoneService } from '../../../services/shipping-zone.service';
import { PebShippingOriginService } from '../../../services/shipping-origin.service';
import { EnvService } from '@pe/common';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';
import { ConfirmDialogService } from '../browse-products/dialogs/dialog-data.service';

@Component({
  selector: 'peb-profiles-dialog-form',
  templateUrl: './profiles-dialog.component.html',
  styleUrls: ['./profiles-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [MediaUrlPipe],
})
export class PebShippingProfileFormComponent extends AbstractComponent implements OnInit, AfterViewInit {
  @ViewChild('picker') zonesPicker: any;
  @ViewChild('productPibker') productPibker: any;
  readonly destroyed$ = new ReplaySubject<boolean>();

  edit = false;
  countries;
  productRef: PeOverlayRef;
  zoneRef: PeOverlayRef;
  originRef: PeOverlayRef;
  origin;
  currency;
  countryNames;
  theme;
  settings: any;
  zones: any;

  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  productsData = [];

  profilesForm: FormGroup = this.formBuilder.group({
    name: [''],
    products: [[]],
    productsData: [],
    origins: [],
    originData: [],
    zones: [],
    zonesData: [],
    isDefault: false,
  });

  zonesAutocomplete = [];

  get businessId() {
    return this.envService.businessId;
  }

  constructor(
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private mediaUrlPipe: MediaUrlPipe,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private cdr: ChangeDetectorRef,
    private overlayService: PeOverlayWidgetService,
    private localConstantsService: LocaleConstantsService,
    private shippingZoneService: PebShippingZoneService,
    private shippingOriginService: PebShippingOriginService,
    private envService: EnvService,
    protected translateService: TranslateService,
    private confirmDialog: ConfirmDialogService,
  ) {
    super(translateService);
  }

  ngOnInit() {
    this.getCountries();
    this.theme = this.overlayConfig.theme;
    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });
  }

  ngAfterViewInit() {
    this.currency = this.overlayData.currency;
    const origins = this.overlayData.settings?.origins;
    let country;
    if (origins?.countryCode) {
      country = this.countries.filter((item) => item.value === origins.countryCode)[0].label;
    }
    if (origins) {
      this.profilesForm.get('originData').setValue(origins._id);
      this.origin = origins;
      this.profilesForm
        .get('origins')
        .patchValue(`${origins.streetName} ${origins.streetNumber}, ${origins.zipCode} ${origins.city}, ${country}`);
    }
    if (this.overlayData?.settings) {
      this.zones = this.overlayData?.settings?.zones;
      this.setZonesAutocomplete();
    }

    if (this.overlayData?.products) {
      this.overlayData?.products.forEach((item) => {
        const image = this.getMediaUrlFromImage(item.images[0]);
        this.productsData.push({ image, id: item.id, name: item.title, sku: item.sku });
      });
      this.cdr.detectChanges();
    }

    if (this.overlayData?.data) {
      country = this.countries.filter((item) => item.value === this.overlayData.data.origins[0].countryCode)[0].label;
      this.profilesForm.get('name').patchValue(this.overlayData.data.name);
      this.profilesForm.get('isDefault').patchValue(this.overlayData.data.isDefault);

      if (this.overlayData.data.products) {
        const products = [];
        this.overlayData.data.products.forEach((product) => {
          product['image'] = product.imageUrl;
          products.push({
            productId: product.hasOwnProperty('id') ? product.id : product.productId ,
            name: product.name,
            sku: product.sku,
            image: product?.image,
            imageUrl: product?.image,
          });
        });
        this.profilesForm.get('products').patchValue(products);

        this.productPibker.emitChanges();
        this.cdr.detectChanges();
      }

      if (this.overlayData.data?.zones[0]?._id) {
        this.profilesForm.get('zones').patchValue(this.overlayData.data?.zones.map((item) => {

          const image = `#icon-flag-${item.countryCodes[0].toLowerCase()}`;
          const pickerObj = { image, label: item.name + `(${this.getCountryName(item)})`, value: item._id };
          this.zonesPicker.onAddItem(pickerObj);
          return pickerObj;
        }));
        this.profilesForm.get('zonesData').patchValue(this.overlayData.data?.zones.map(item => item._id));
        this.countryNames = this.overlayData.data?.zones[0]?.countryCodes;
      }
      if (this.overlayData.data?.origins[0]?._id) {
        this.profilesForm.get('originData').setValue(this.overlayData.data?.origins[0]?._id);
        this.origin = this.overlayData.data?.origins[0];
        this.profilesForm
          .get('origins')
          .patchValue(
            `${this.overlayData.data?.origins[0]?.streetName} ${this.overlayData.data?.origins[0]?.streetNumber || ''}, ${
              this.overlayData.data?.origins[0]?.zipCode
            } ${this.overlayData.data?.origins[0]?.city}, ${country}`,
          );
      }

      this.edit = true;
    }
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    this.countries.push({
      value: 'All',
      label: 'All Countries',
    });

    Object.keys(countryList).map((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }

  openProductDialog = () => {
    const config: PeOverlayConfig = {
      data: { data: this.profilesForm.get('products').value[0] ? this.productsData : null },
      headerConfig: {
        hideHeader: true,
        title: 'Products',
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          this.productRef.close();
        },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.productRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      component: PebBrowseProductsFormComponent,
      lazyLoadedModule: PebShippingModule,
      panelClass: 'products-dialog',
    };
    this.productRef = this.overlayService.open(config);
    this.productRef.afterClosed
      .pipe(
        tap((data) => {
          if (data) {
            const products = [];
            this.profilesForm.get('products').setValue([]);
            data.forEach((element) => {
              if (element) {
                const image = element?.hasOwnProperty('images') ? this.getMediaUrlFromImage(element.images[0]) : element?.image;
                products.push({
                  image,
                  productId: element.id,
                  name: element.title,
                  sku: element.sku,
                  imageUrl: image,
                });
              }
            });

            this.productsData = this.getProductsData(products);
            this.profilesForm.get('products').patchValue(products);
            this.cdr.detectChanges();
          } else {
            this.productsData = [];
            this.profilesForm.get('products').setValue([]);
            this.cdr.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  openCreateZoneDialog = () => {
    const config: PeOverlayConfig = {
      data: { currency: this.currency, items: this.zones, connections: this.overlayData?.connections },
      headerConfig: {
        title: this.translateService.translate('shipping-app.forms.profiles_dialog.create_zone'),
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('zone', 'adding'), this.zoneRef);
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.zoneRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('zone', 'adding'), this.zoneRef);
      },
      component: PebShippingEditOptionsComponent,
      panelClass: 'zone-dialog',
    };
    this.zoneRef = this.overlayService.open(config);
    this.zoneRef.afterClosed
      .pipe(
        tap((data) => {
          if (data) {
            this.shippingZoneService
              .addShippingZone(data)
              .pipe(
                tap((response: any) => {
                  const obj = this.getZonesAutocompleteObject(response);
                  this.zonesAutocomplete.push(obj);
                  let zonesData = [response._id];
                  let zones = [obj];
                  if (this.profilesForm.get('zonesData').value?.length > 0) {
                    zonesData = this.profilesForm.get('zonesData').value;
                    zones = this.profilesForm.get('zones').value;
                    zonesData.push(response._id);
                    zones.push(obj);
                  }
                  this.profilesForm.get('zonesData').patchValue(zonesData);
                  this.countryNames = response.countryCodes;
                  this.profilesForm.get('zones').patchValue(zones);
                  this.zonesPicker.emitChanges();
                  this.cdr.detectChanges();
                }),
                catchError((err) => {
                  throw new Error(err);
                }),
              )
              .subscribe();

            this.cdr.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  openEditOriginDialog = () => {
    const config: PeOverlayConfig = {
      data: {
        data: this.origin || null,
        isProfile: this.origin,
      },
      headerConfig: {
        title: this.translateService.translate('shipping-app.forms.profiles_dialog.edit_origin'),
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('location', 'editing'), this.originRef);
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.originRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('location', 'editing'), this.originRef);
      },
      component: LibShippingEditLocationModalComponent,
      panelClass: 'origin-dialog',
    };
    this.originRef = this.overlayService.open(config);
    this.originRef.afterClosed
      .pipe(
        tap((data) => {
          if (data) {
            const country = this.countries.filter((item) => item.value === data.data.countryCode)[0].label;
            this.shippingOriginService
              .postOrigin(data.data)
              .pipe(
                tap((_: any) => {
                  this.profilesForm.get('originData').setValue(_._id);
                  this.cdr.detectChanges();
                }),
                catchError((err) => {
                  throw new Error(err);
                }),
              )
              .subscribe();
            this.origin = data.data;
            this.profilesForm
              .get('origins')
              .patchValue(`${data.data.streetName} ${data.data.streetNumber || ''}, ${data.data.zipCode} ${data.data.city}, ${country}`);
            this.cdr.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  onCheckValidity() {
    const control = this.profilesForm.controls;

    control.name.setValidators([Validators.required]);
    control.name.updateValueAndValidity();

    control.origins.setValidators([Validators.required]);
    control.origins.updateValueAndValidity();

    control.zones.setValidators([Validators.required]);
    control.zones.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.profilesForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.profilesForm.valid) {
      const control = this.profilesForm.controls;
      if (this.edit) {
        const profiles = {
          data: {
            isDefault: control.isDefault.value,
            name: control.name.value,
            business: this.overlayData.data.business,
            products: control.products.value,
            zones: control.zonesData.value,
            origins: [control.originData.value],
          },
          id: this.overlayData.data._id,
        };

        this.peOverlayRef.close(profiles);
      } else {
        const profiles = {
          isDefault: control.isDefault.value,
          name: control.name.value,
          business: this.businessId,
          products: control.products.value,
          zones: control.zonesData.value,
          origins: [control.originData.value],
        };
        this.peOverlayRef.close(profiles);
      }
    }
  }

  onRemoveZone() {
    this.profilesForm.get('zonesData').reset();
    this.profilesForm.get('zones').patchValue('');
  }

  onEditZone = (e) => {
    this.shippingZoneService.getShippingZoneById(this.profilesForm.get('zonesData').value[e]).subscribe((response: any) => {
      const config: PeOverlayConfig = {
        data: { data: response, currency: this.currency, items: this.zones, connections: this.overlayData?.connections },
        headerConfig: {
          title: response.name,
          backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
          backBtnCallback: () => {
            this.showConfirmationWindow(this.getConfirmationContent('zone', 'editing'), this.zoneRef);
          },
          doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
          doneBtnCallback: () => {
            this.onSaveSubject$.next(this.zoneRef);
          },
          onSaveSubject$: this.onSaveSubject$,
          onSave$: this.onSave$,
          theme: this.theme,
        },
        backdropClick: () => {
          this.showConfirmationWindow(this.getConfirmationContent('zone', 'editing'), this.zoneRef);
        },
        component: PebShippingEditOptionsComponent,
      };
      this.zoneRef = this.overlayService.open(config);
      this.zoneRef.afterClosed
        .pipe(
          tap((data) => {
            if (data) {
              this.shippingZoneService
                .editShippingZone(data.id, data.data)
                .pipe(
                  tap((_: any) => {
                    this.zones.splice(this.zones.indexOf(this.zones.find(item => item._id === data.id)), 1);
                    this.zones.push({ _id: data.id, ...data.data });
                    const newItem = this.getZonesAutocompleteObject(this.zones[this.zones.length - 1]);
                    const itemToRemov = this.zonesAutocomplete.find((item) => item.value === newItem.value);
                    this.zonesAutocomplete.splice(this.zonesAutocomplete.indexOf(itemToRemov), 1);
                    this.zonesAutocomplete.push(newItem);
                    this.zonesPicker.changeEditedItem(newItem);
                    this.countryNames = data.data.countryCodes;
                    this.profilesForm.get('zones').patchValue(this.zonesPicker.pickedItems);
                    this.profilesForm.get('zonesData').patchValue(this.zonesPicker.pickedItems.map(item => item.value));
                    this.cdr.detectChanges();
                  }),
                )
                .subscribe();

              this.cdr.detectChanges();
            }
          }),
          takeUntil(this.destroyed$),
        )
        .subscribe();
    });
  }

  zoneChanged(e) {
    if (e) {
      this.profilesForm.get('zones').patchValue(e);
      this.profilesForm.get('zonesData').patchValue(e.map(item => item.value));
      this.cdr.detectChanges();
    }
  }

  setZonesAutocomplete() {
    if (this.zones && this.zones.length > 0) {
      this.zonesAutocomplete = this.zones.map((zone: any) => {
        return this.getZonesAutocompleteObject(zone);
      });
    }
  }

  getCountryName(zone) {
    return this.countries.find(item => item.value === zone?.countryCodes[0])?.label;
  }

  getZonesAutocompleteObject(zone) {
    const label = zone.name + `(${this.getCountryName(zone)})`;
    const image = `#icon-flag-${zone?.countryCodes[0].toLowerCase()}`;
    // tslint:disable-next-line:object-shorthand-properties-first
    return { label, image, value: zone._id };
  }
  onChangeProduct(e) {
    if (e) {
      const products = [];
      this.profilesForm.get('products').setValue([]);
      this.productsData = [];
      e.forEach((element) => {
        products.push({
          productId: element.hasOwnProperty('id') ? element.id : element.productId ,
          name: element.name,
          sku: element.sku,
          image: element?.image,
          imageUrl: element?.image,
        });
      });
      this.productsData = this.getProductsData(products);
      this.profilesForm.get('products').patchValue(products);
      this.cdr.detectChanges();
    }
  }

  getProductsData(products) {
    return products.map((item) => {
      return { id: item.productId, name: item.name, image: item.image, sku: item.sku };
    });
  }

  getMediaUrlFromImage(image) {
    return this.mediaUrlPipe.transform(image, MediaContainerType.Products, 'grid-thumbnail' as any);
  }

  showConfirmationWindow(dialogContent, dialogRef) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
    ).subscribe(() => {
      dialogRef.close();
    });
  }
}
