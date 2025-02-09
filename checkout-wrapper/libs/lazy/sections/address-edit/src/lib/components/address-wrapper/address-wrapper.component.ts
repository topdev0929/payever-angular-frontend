import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Actions, ofActionCompleted, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable, combineLatest, merge, of } from 'rxjs';
import { filter, map, scan, switchMap, takeUntil, tap } from 'rxjs/operators';

import { SaveProgressHelperService, noShippingAddress } from '@pe/checkout/core';
import { AddressStorageService } from '@pe/checkout/storage';
import {
  FlowState,
  OpenNextStep,
  ParamsState,
  PatchFlow,
  SettingsState,
  StepsState,
} from '@pe/checkout/store';
import {
  AccordionPanelInterface,
  AddressTypeEnum,
  CheckoutStateParamsInterface,
  FlowInterface,
  SectionType,
  ShippingAddressSettings,
} from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { AddressService } from '../../services';

interface ViewModel {
  isOnlyBilling: boolean;
  filledFieldsReadonly: boolean;
  isPhoneRequired: boolean;
  isCodeForPhoneRequired: boolean;
  loading: boolean;
  continueText: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-address-wrapper',
  templateUrl: 'address-wrapper.component.html',
  styleUrls: ['address-wrapper.component.scss'],
  providers: [PeDestroyService],
})
export class AddressWrapperComponent implements OnInit, OnDestroy {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  @Select(SettingsState.settings) private settings$!: Observable<FlowInterface>;

  @Select(FlowState.shippingAddressSettings) private shippingAddressSettings$!: Observable<ShippingAddressSettings>;

  @Select(ParamsState.params) private params$!: Observable<CheckoutStateParamsInterface>;

  @Select(StepsState.steps) private steps$!: Observable<AccordionPanelInterface[]>;

  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  readonly AddressTypeEnum = AddressTypeEnum;

  isSingleAddress = true;

  public formGroup = this.fb.group({
    billingAddress: this.fb.control<any>(
      this.temporaryAddress.getTemporaryAddress(this.flow.id)
        || this.flow.billingAddress
    ),
    shippingAddress: [{ disabled: this.isSingleAddress, value: this.flow.shippingAddress }],
  });

  private isOnlyBilling$ = combineLatest([
    this.shippingAddressSettings$,
    this.settings$,
  ]).pipe(
    map(([shippingAddressSettings, settings]) => ({
        isOnlyBilling: !shippingAddressSettings?.shippingAddressAllowed
          || this.flow.paymentOptions.length === 1
          && noShippingAddress.includes(this.flow.paymentOptions[0].paymentMethod)
          || settings.channelType === 'pos',
      })),
  );

  private filledFieldsReadonly$ = combineLatest([
    this.params$.pipe(
      map(params => params.forceAddressOnlyFillEmptyAllowed),
    ),
    this.steps$.pipe(
      map(panels => !panels.find(panel => panel.name === SectionType.User)),
    ),
  ]).pipe(
    map(([isForceAddressOnlyFillEmptyAllowed, noUserStep]) => ({
      filledFieldsReadonly: isForceAddressOnlyFillEmptyAllowed && noUserStep,
    })),
  );

  private loading$ = merge(
    this.actions$.pipe(
      ofActionDispatched(PatchFlow),
      map(() => true),
    ),
    this.actions$.pipe(
      ofActionCompleted(PatchFlow),
      switchMap(({ result }) => result.successful
        ? this.store.dispatch(new OpenNextStep())
        : of(false)
      ),
    ),
  );

  private continueText$ = this.steps$.pipe(
    map(panels => panels.findIndex(panel => panel.name === SectionType.Address) === panels.length - 1
      ? $localize`:@@action.pay:`
      : $localize`:@@action.continue:`,
    ),
  );

  public vm$ = merge(
    this.isOnlyBilling$,
    this.filledFieldsReadonly$,
    this.params$.pipe(
      map(({ forcePhoneRequired, forceCodeForPhoneRequired }) => ({
        isPhoneRequired: forcePhoneRequired,
        isCodeForPhoneRequired: forceCodeForPhoneRequired,
      })),
    ),
    this.loading$.pipe(
      map(loading => ({ loading })),
    ),
    this.continueText$.pipe(
      map(continueText => ({ continueText })),
    ),
  ).pipe(
    scan((acc, curr) => ({ ...acc, ...curr }), {} as ViewModel),
  );

  constructor(
    public cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private addressService: AddressService,
    private addressHelperService: AddressStorageService,
    private destroy$: PeDestroyService,
    private saveProgressHelperService: SaveProgressHelperService,
    private readonly temporaryAddress: AddressStorageService,
  ) {}

  ngOnInit(): void {
    this.saveProgressHelperService.editting[this.flow.id] = true;

    this.saveProgressHelperService.trigger$.pipe(
      filter(({ flowId }) => flowId === this.flow.id),
      takeUntil(this.destroy$),
      tap(({ callback }) => {
        this.submit(() => {
          callback({ flow: this.flow, openNextStep: false });
        });
      }),
    ).subscribe();

    this.setSingleAddress(this.flow.shippingAddress
      && !!Object.values(this.flow.shippingAddress).filter(Boolean).length);
  }

  ngOnDestroy(): void {
    this.saveProgressHelperService.editting[this.flow.id] = false;
  }

  setSingleAddress(checked: boolean): void {
    this.isSingleAddress = !checked;
    !this.isSingleAddress
      ? this.formGroup.get('shippingAddress').enable()
      : this.formGroup.get('shippingAddress').disable();

    this.cdr.detectChanges();
  }

  submit(callback: () => void = null): void {
    !callback && this.formGroupDirective.onSubmit(null);

    const { valid, value } = this.formGroup;
    if (!valid) {
      callback?.();

      return;
    }

    const {
      billingAddress: { company: billingCompany, customerType, ...billingAddress },
      shippingAddress,
    } = value;

    this.addressHelperService.setTemporaryAddress(this.flow.id, null);
    this.store.dispatch(
      new PatchFlow({
        billingAddress,
        customerType,
        shippingAddress: this.isSingleAddress ? null : shippingAddress,
        company: billingCompany ? {
          externalId: billingCompany.id,
          name: billingCompany.name,
        } : null,
      })
    );
  }
}
