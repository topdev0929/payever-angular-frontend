import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { PersonalFormComponent } from './personal-form.component';


describe('PersonalFormComponent', () => {
  const storeHelper = new StoreHelper();
  let component: PersonalFormComponent;
  let fixture: ComponentFixture<PersonalFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        CheckoutUiTooltipModule,
        CheckoutFormsInputCurrencyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressStorageService,
        { provide: PaymentInquiryStorage, useValue: {} },
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
        NgControl,
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        PersonalFormComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(PersonalFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });


  describe('Initialization', () => {

    it('should initialize form group with expected controls', () => {
      const expectedControls = [
        'norwegianCitizen',
        'residentialStatus',
        'maritalStatus',
        'professionalStatus',
        'employedSince',
        'employmentPercent',
        'employer',
        'netMonthlyIncome',
        'rentIncome',
        'numberOfChildren',
      ];

      expectedControls.forEach((controlName) => {
        expect(component.formGroup.get(controlName)).toBeDefined();
      });
    });

    it('should set up subscriptions in ngOnInit', () => {
      jest.spyOn(component.formGroup.get('professionalStatus').valueChanges, 'pipe');
      jest.spyOn(component.formGroup.get('professionalStatus').valueChanges, 'subscribe');

      component.ngOnInit();

      expect(component.formGroup.get('professionalStatus').valueChanges.pipe).toHaveBeenCalled();
      expect(component.formGroup.get('professionalStatus').valueChanges.subscribe).toHaveBeenCalled();
    });

    it('should enable/disable controls based on professionalStatus value changes', fakeAsync(() => {
      component.ngOnInit();
      component.formGroup.get('professionalStatus').setValue('EMPLOYED');

      tick();

      expect(component.formGroup.get('employer').enabled).toBeTruthy();
      expect(component.formGroup.get('employedSince').enabled).toBeTruthy();
      expect(component.formGroup.get('employmentPercent').enabled).toBeTruthy();

      component.formGroup.get('professionalStatus').setValue('AnotherStatus');

      tick();

      expect(component.formGroup.get('employer').enabled).toBeFalsy();
      expect(component.formGroup.get('employedSince').enabled).toBeFalsy();
      expect(component.formGroup.get('employmentPercent').enabled).toBeFalsy();
    }));
  });

  describe('setMonthAndYear', () => {
    it('should set the month and year', () => {
      const date = new Date();
      const element = { close: jest.fn() };

      component.setMonthAndYear(date, element);

      expect(element.close).toHaveBeenCalled();
      expect(component.formGroup.get('employedSince')?.value)
        .toEqual(new Date(date.getFullYear(), date.getMonth(), new Date().getDay()));
    });
  });

  describe('registerOnChange', () => {
    it('should register the onChange function', fakeAsync(() => {
      const onChangeSpy = jest.fn();
      jest.spyOn(component.formGroup.valueChanges, 'pipe');
      jest.spyOn(component.formGroup.valueChanges, 'subscribe');

      component['onTouch'] = jest.fn();
      component.registerOnChange(onChangeSpy);

      expect(component.formGroup.valueChanges.pipe).toHaveBeenCalled();
      expect(component.formGroup.valueChanges.subscribe).toHaveBeenCalled();

      component.formGroup.get('norwegianCitizen').patchValue(true);

      tick();

      expect(onChangeSpy).toHaveBeenCalled();
    }));
  });
});
