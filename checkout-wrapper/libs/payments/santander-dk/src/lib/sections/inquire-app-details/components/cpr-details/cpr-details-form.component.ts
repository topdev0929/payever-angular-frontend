/// <reference types="@types/google.maps" />
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { defer, merge } from 'rxjs';
import { debounceTime, filter, map, scan, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { AddressAutocompleteService, AddressItem, addressMask } from '@pe/checkout/forms/address-autocomplete';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { AddressInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { CprDetailsFormValue, FormValue, SantanderDkFlowService } from '../../../../shared';
import { socialSecurityNumberValidator } from '../validators';

@Component({
  selector: 'cpr-details-form',
  templateUrl: './cpr-details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class CprDetailsFormComponent extends CompositeForm<CprDetailsFormValue> implements OnInit {

  private store = this.injector.get(Store);
  private flowService = this.injector.get(SantanderDkFlowService);
  protected addressAutocompleteService = this.injector.get(AddressAutocompleteService);

  public readonly formGroup = this.fb.group({
    _addressLine: this.fb.control<string | AddressItem>(null),
    firstName: this.fb.control<string>(null, Validators.required),
    lastName: this.fb.control<string>(null, Validators.required),
    socialSecurityNumber: this.fb.control<string>(
      null,
      [Validators.required, socialSecurityNumberValidator],
    ),
    city: this.fb.control<string>(null, Validators.required),
    address: this.fb.control<string>(null, Validators.required),
    postalCode: this.fb.control<string>(null, Validators.required),

    _insuranceEnabled: this.fb.control<boolean>(null),
    _insuranceMonthlyCost: this.fb.control<number>(null),
    _insurancePercent: this.fb.control<number>(null),
  });

  private formData: FormValue = this.store.selectSnapshot(PaymentState.form);

  private fetchInsuranceData$ = defer(() => this.formGroup.get('socialSecurityNumber').valueChanges.pipe(
    startWith(this.formGroup.get('socialSecurityNumber').value),
    debounceTime(300),
    filter(() => this.formGroup.get('socialSecurityNumber').valid),
    switchMap(ssn => this.flowService.getInsuranceConfig({
      applicationNumber: this.formData?.mitIdForm?.applicationNumber?.toString(),
      debtorId: this.formData?.mitIdForm?.debtorId?.toString(),
      cpr: ssn,
    }).pipe(
      tap(({ insuranceEnabled, insuranceMonthlyCost, insurancePercent }) => {
        this.formGroup.patchValue({
          _insuranceEnabled: insuranceEnabled,
          _insuranceMonthlyCost: insuranceMonthlyCost,
          _insurancePercent: insurancePercent,
        });
      }),
    )),
  ));

  public loadingInsurance$ = merge(
    this.formGroup.get('socialSecurityNumber').valueChanges.pipe(
      map(value => !!value),
    ),
    this.fetchInsuranceData$.pipe(
      map(() => false),
    ),
  );

  public readonly socialSecurityNumberMask = (value: string) => value
    ? value.replace(/\D/g, '').replace(/(\d{6})(\d{1,4})/, '$1-$2').slice(0, 11)
    : value;

  public readonly socialSecurityNumberUnmask = (value: string) => value ? value.replace(/-/g, '') : value;
  public readonly addressMask = addressMask;

  public readonly addressItems$ = this.addressAutocompleteService.addressItems$;

  ngOnInit(): void {
    super.ngOnInit();

    const updateFullAddress$ = merge(
      this.formGroup.get('city').valueChanges.pipe(
        startWith(this.formGroup.get('city').value),
        map(city => ({ city })),
      ),
      this.formGroup.get('address').valueChanges.pipe(
        startWith(this.formGroup.get('address').value),
        map(street => ({ street })),
      ),
      this.formGroup.get('postalCode').valueChanges.pipe(
        startWith(this.formGroup.get('postalCode').value),
        map(zipCode => ({ zipCode })),
      ),
    ).pipe(
      scan((acc, curr) => ({ ...acc, ...curr }), {} as AddressInterface),
      tap((value) => {
        const fullAddress = this.makeAddress(value);
        this.formGroup.get('_addressLine').patchValue(fullAddress, { emitEvent: false });
      }),
      takeUntil(this.destroy$),
    );

    updateFullAddress$.subscribe();
  }

  writeValue(obj: CprDetailsFormValue): void {
    const { city, street, zipCode } = this.store.selectSnapshot(FlowState.address);

    this.formGroup.patchValue({
      city,
      address: street,
      postalCode: zipCode,
      ...obj,
    } as CprDetailsFormValue);
  }

  public fullAddressChange(value: Partial<AddressInterface>): void {
    this.formGroup.patchValue({
      city: value.city,
      address: value.streetName,
      postalCode: value.zipCode,
    });
  }

  private makeAddress({ city, street, zipCode }: Partial<AddressInterface>) {
    return [street ?? '', city ?? '', zipCode ?? ''].filter(Boolean).join(', ').trim();
  }
}
