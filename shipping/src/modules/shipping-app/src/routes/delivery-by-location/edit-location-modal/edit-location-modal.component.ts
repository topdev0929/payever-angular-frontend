import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { AbstractComponent } from '../../../misc/abstract.component';
import { PE_OVERLAY_SAVE, PeOverlayRef, PE_OVERLAY_DATA, PE_OVERLAY_CONFIG, OverlayHeaderConfig } from '@pe/overlay-widget';
import { skip } from 'rxjs/operators';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { ShippingOriginInterface } from '../../../interfaces';

@Component({
  selector: 'lib-shipping-form',
  templateUrl: './edit-location-modal.component.html',
  styleUrls: ['./edit-location-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LibShippingEditLocationModalComponent extends AbstractComponent implements OnInit {
  readonly destroyed$ = new ReplaySubject<boolean>();

  edit = false;
  countries;
  theme;
  address = '';

  locationForm: FormGroup = this.formBuilder.group({
    address: [''],
    name: [''],
    streetAddress: [''],
    city: [''],
    zipCode: [''],
    stateProvinceCode: [''],
    countryCode: ['DE'],
    phone: [''],
    phonePrefix: [''],
    phoneCountry: [''],
  });
  jsonURL = '/assets/json_data/countries_list.json';
  countriesWithCodes = [];

  @ViewChild('streetAddress') addressText: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private http: HttpClient,
    private localConstantsService: LocaleConstantsService,
    protected translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
  ) {
    super(translateService);
  }

  ngOnInit() {
    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });
    this.getCountries();
    this.theme = this.overlayConfig.theme;
    if (this.overlayData?.data?._id) {
      this.edit = true;
    }
    this.setOriginForm();
    const selectedCountry = this.locationForm.get('countryCode').value;
    this.getJSON().subscribe((data) => {
      this.countriesWithCodes = data;
      this.locationForm.controls.phoneCountry.setValue(selectedCountry);
      this.updatePhonePrefix(selectedCountry);
    });
    this.locationForm.controls.streetAddress.valueChanges.subscribe((val) => {
      this.setAddressValue();
    });

    this.locationForm.controls.zipCode.valueChanges.subscribe((val) => {
      this.setAddressValue();
    });

    this.locationForm.controls.countryCode.valueChanges.subscribe((val) => {
      this.locationForm.get('phoneCountry').patchValue(val);
      this.setAddressValue();
    });

    this.locationForm.controls.phoneCountry.valueChanges.subscribe((val) => {
      if (this.locationForm.controls.countryCode.value !== this.locationForm.controls.phoneCountry.value) {
        this.locationForm.get('countryCode').setValue(val);
      }
      this.setAddressValue();
      this.updatePhonePrefix(val);
    });

    this.locationForm.controls.city.valueChanges.subscribe((val) => {
      this.locationForm.controls.city.patchValue(val.replace(/[0-9]/g, ''), { onlySelf: true, emitEvent: false });
      this.setAddressValue();
    });
  }

  setOriginForm() {
    const formData: ShippingOriginInterface = this.overlayData.data;
    formData.streetAddress = `${formData.streetName} ${formData.streetNumber}`;
    this.locationForm.patchValue(formData);
    this.setAddressValue();
  }

  setAddressValue() {
    this.address = `${this.locationForm.get('streetAddress').value}, ${this.locationForm.get('zipCode').value || ''}, ${this.locationForm.get('city').value}, ${this.countries.find(val => val.value.toLowerCase() === this.locationForm.get('countryCode').value.toLowerCase()).label}`;
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    Object.keys(countryList).map((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }

  onLocationSelected(event) {}

  public getJSON(): Observable<any> {
    return this.http.get(this.jsonURL);
  }

  updatePhonePrefix(selectedCountry) {
    this.locationForm.get('phonePrefix').setValue(`${this.getPhoneCodeByCountryCode(selectedCountry)} `);
    this.locationForm.get('phonePrefix').updateValueAndValidity();
    this.cdr.detectChanges();
  }

  addToArray(element: any, array: any): void {
    const elementId = element?.id ?? element?._id;

    if (!array.some((element) => element === elementId || element === elementId)) {
      array.push(elementId);
    }
  }

  getFromArray(array: any, id: string) {
    return array.find((element) => element.id === id || element._id === id);
  }

  onClose() {
    this.peOverlayRef.close();
  }

  onCheckValidity() {
    const value = this.locationForm.controls;

    value.name.setValidators([Validators.required]);
    value.name.updateValueAndValidity();

    value.streetAddress.setValidators([Validators.required]);
    value.streetAddress.updateValueAndValidity();

    value.zipCode.setValidators([Validators.required]);
    value.zipCode.updateValueAndValidity();

    value.city.setValidators([Validators.required]);
    value.city.updateValueAndValidity();

    value.countryCode.setValidators([Validators.required]);
    value.countryCode.updateValueAndValidity();

    value.phone.setValidators([this.phoneLengthValidation(4, 15)]);
    value.phone.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.locationForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    const value = this.locationForm.controls;
    if (this.locationForm.valid) {
      const streetNumber = value.streetAddress.value.split(/(\d+)/g);
      const streetName = value.streetAddress.value.replace(streetNumber[1], '').replace(',', '').trim();
      const locationValues = {
        data: {
          streetName,
          streetNumber: streetNumber[1] || '',
          name: value.name.value,
          zipCode: String(value.zipCode.value),
          city: value.city.value,
          countryCode: value.countryCode.value,
          phone: `${value.phonePrefix.value.replace(/\s+/g, '')} ${value.phone.value}`,
        },
      };
      if (this.edit) {
        locationValues['id'] = this.overlayData.data._id;
      }
      this.peOverlayRef.close(locationValues);
    }
  }

  getPhoneCodeByCountryCode(code) {
    const foundCode = this.countriesWithCodes.find((country) => country.code.toLowerCase() === code.toLowerCase());
    return foundCode?.dial_code.replace(/\s/g, '') || '';
  }

  onAutocompleteSelected(places) {
    const postCode = places.address_components.find(val => val.types.includes('postal_code'))?.long_name || '';
    const city = places.address_components.find(val => val.types.includes('locality'))?.long_name || '';
    const country = places.address_components.find(val => val.types.includes('country')) || '';
    const streetNumber = places.address_components.find(val => val.types.includes('street_number'))?.long_name || '';
    const streetName = places.address_components.find(val => val.types.includes('route'))?.long_name || '';

    this.locationForm.get('zipCode').setValue(postCode);
    this.locationForm.get('city').setValue(city);
    this.locationForm.get('countryCode').setValue(country?.short_name);
    this.locationForm.get('streetAddress').setValue(`${streetName} ${streetNumber}`);
    this.address = places.formatted_address;
  }

  numericOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return !(charCode === 101 || charCode === 69 || charCode === 45 || charCode === 46  || charCode === 44 || charCode === 43);
  }

  private phoneLengthValidation(min, max): any {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (control.value) {
        const allow = control.value.toString().length < min || control.value.toString().length > max;
        return allow ? { phoneLength : `${min}, ${max}` } : null;
      }
      return null;
    };
  }
}
