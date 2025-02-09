import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { LocaleConstantsService } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { FormTranslationsService } from '../../../../services';
import { DIGIT_FORBIDDEN_PATTERN, SPECIAL_CHAR_FORBIDDEN_PATTERN } from '../../../../misc/constants';

@Component({
  selector: 'peb-edit-address',
  templateUrl: './edit-address.component.html',
  styleUrls: ['./edit-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditAddressComponent implements OnInit {
  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public locationForm: FormGroup = this.formBuilder.group({
    address: [''],
    street: ['', [Validators.required, Validators.pattern(SPECIAL_CHAR_FORBIDDEN_PATTERN)]],
    city: ['', [Validators.required, Validators.pattern(DIGIT_FORBIDDEN_PATTERN)]],
    zipCode: ['', [Validators.required, Validators.pattern(SPECIAL_CHAR_FORBIDDEN_PATTERN)]],
    country: ['DE', [Validators.required]],
  });
  public countries: { value: string, label: string }[];
  public address = '';
  private data: any;

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    public formTranslationsService: FormTranslationsService,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private apm: ApmService,
    private localConstantsService: LocaleConstantsService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
  ) {}

  ngOnInit() {
    if (this.overlayData.data.details) {
      this.data = this.overlayData.data.business;
      const details = this.overlayData.data.details.companyAddress;
      this.locationForm.patchValue(details);
    }
    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroy$)
    ).subscribe();
    this.getCountries();
    this.setOriginForm();

    this.locationForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.setAddressValue();
    });

    this.formTranslationsService.formTranslationNamespace = 'form.create_form.address';
  }

  public onSave() {
    if (this.locationForm.valid) {
      this.data['businessDetail'] = { companyAddress: this.locationForm.value };
      this.peOverlayRef.close({ data: this.data });
    }
  }

  public onAutocompleteSelected(places) {
    const postCode = places.address_components.find(val => val.types.includes('postal_code'))?.long_name || '';
    const city = places.address_components.find(val => val.types.includes('locality'))?.long_name || '';
    const country = places.address_components.find(val => val.types.includes('country')) || '';
    const streetNumber = places.address_components.find(val => val.types.includes('street_number'))?.long_name || '';
    const streetName = places.address_components.find(val => val.types.includes('route'))?.long_name || '';

    this.locationForm.get('zipCode').setValue(postCode);
    this.locationForm.get('city').setValue(city);
    this.locationForm.get('country').setValue(country?.short_name);
    this.locationForm.get('street').setValue(`${streetName} ${streetNumber}`);
    this.address = places.formatted_address;
  }

  public fieldErrorMessage(formControlName: string): string {
    const control = this.locationForm.get(formControlName);

    if (control.errors?.required) {
      return this.translateService.translate('common.forms.validations.required');
    }
    if (control.errors?.pattern) {
      return this.translateService.translate('form.create_form.errors.pattern');
    }

    return null;
  }

  private setOriginForm() {
    const formData = this.overlayData.data;
    formData.streetAddress = `${formData.street}`;
    this.locationForm.patchValue(formData);
    this.setAddressValue();
  }

  private setAddressValue() {
    const array = [
      this.locationForm.get('street').value ?? '',
      this.locationForm.get('zipCode').value ?? '',
      this.locationForm.get('city').value ?? '',
      this.countries.find(val => val.value.toLowerCase() === this.locationForm.get('country').value.toLowerCase())
        .label,
    ];
    this.address = array.filter(Boolean).join(', ');
  }

  private getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    if (countryList) {
      Object.keys(countryList).forEach((countryKey) => {
        this.countries.push({
          value: countryKey,
          label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
        });
      });
    } else {
      this.apm.apm.captureError(`Settings edit address could not load countries on this business ${this.data.id}`);
    }
  }
}
