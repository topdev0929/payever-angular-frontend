import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { AbstractComponent } from '../../../misc/abstract.component';
import { MinRequirements } from '../../../enums/MinRequirements';
import { PeOverlayRef, PE_OVERLAY_DATA, PE_OVERLAY_SAVE } from '@pe/overlay-widget';
import { skip } from 'rxjs/operators';
import { TranslateService } from '@pe/i18n-core';

@Component({
  selector: 'peb-free-shipping-form',
  templateUrl: './free-shipping-form.component.html',
  styleUrls: ['./free-shipping-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShippingFormComponent
  extends AbstractComponent
  implements OnInit {
  readonly destroyed$ = new ReplaySubject<boolean>();

  edit = false;
  countries;
  countriesAutocomplete;

  appliesTo = [
    { label: 'Specific collections', value: 'SPECIFIC_COLLECTIONS' },
  ];

  minRequirements = [
    {
      label: 'Minimum purchase amount',
      value: MinRequirements.MIN_PURCHASE_AMOUNT,
    },
  ];

  shippingForm: FormGroup = this.formBuilder.group({
    name: ['Free Shipping'],
    isActive: true,
    appliesTo: ['DHL'],
    countries: [[]],
    discount: [''],
    minPurchaseAmount: [''],
    shippingRatesOverCertainValue: [true],
    minRequirements: [MinRequirements.MIN_PURCHASE_AMOUNT],
  });

  constructor(
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private cdr: ChangeDetectorRef,
    protected translateService: TranslateService,
  ) {
    super(translateService);
  }

  get rates() {
    return this.shippingForm.get('rates') as FormArray;
  }

  ngOnInit() {

    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });

    this.countriesAutocomplete = this.countries.map(country => country.title);

    if (this.overlayData) {
      const formData = this.overlayData.data;

      this.shippingForm
        .get('appliesTo')
        .setValue(formData.data.appliesTo);
      this.shippingForm
        .get('countries')
        .setValue(formData.data.countries);
      this.shippingForm
        .get('discount')
        .setValue(formData.data.discount);
      this.shippingForm
        .get('minPurchaseAmount')
        .setValue(formData.data.minPurchaseAmount);
      this.shippingForm
        .get('minRequirements')
        .setValue(formData.data.minRequirements);
      this.shippingForm
        .get('shippingRatesOverCertainValue')
        .setValue(formData.data.shippingRatesOverCertainValue);
    }

    this.countries = this.overlayData.countries;
  }

  addToArray(element: any, array: any): void {
    const elementId = element?.id ?? element?._id;

    if (
      !array.some(element => element === elementId || element === elementId)
    ) {
      array.push(elementId);
    }
  }

  getFromArray(array: any, id: string) {
    return array.find(element => element.id === id || element._id === id);
  }

  removeFromArray(array: any, index: number): void {
    array.splice(index, 1);
  }

  onClose() {
    this.peOverlayRef.close();
  }

  onCheckValidity() {
    const value = this.shippingForm.controls;

    value.appliesTo.setValidators([Validators.required]);
    value.appliesTo.updateValueAndValidity();

    value.countries.setValidators([Validators.required]);
    value.countries.updateValueAndValidity();

    value.minPurchaseAmount.setValidators([Validators.required]);
    value.minPurchaseAmount.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.shippingForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.shippingForm.valid) {
      this.peOverlayRef.close(this.shippingForm.value);
    }
  }
}
