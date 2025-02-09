import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../test';

import { InquireFormMitidSkatComponent } from './inquire-form-mitid-skat.component';

describe('InquireFormMitidSkatComponent', () => {

  let component: InquireFormMitidSkatComponent;
  let fixture: ComponentFixture<InquireFormMitidSkatComponent>;

  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [InquireFormMitidSkatComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: FormControl, useValue: new FormControl() },
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: paymentFormFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(InquireFormMitidSkatComponent);
    component = fixture.componentInstance;

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should init formGroup with correct form controls', () => {

    const formGroup = component.formGroup;
    const formControls = Object.keys(formGroup.controls);

    expect(formControls).toContain('mitIdForm');
    expect(formControls).toContain('skatIdForm');
    expect(formControls).toContain('bankConsentForm');

    expect(formGroup.get('mitIdForm').validator).toBeTruthy();
    expect(formGroup.get('skatIdForm').validator).toBeTruthy();
    expect(formGroup.get('bankConsentForm').validator).toBeTruthy();

  });

  it('should update form values on init', () => {

    component.ngOnInit();

    expect(component.formGroup.value).toEqual({
      mitIdForm: paymentFormFixture().mitIdForm,
      skatIdForm: paymentFormFixture().skatIdForm,
      bankConsentForm: paymentFormFixture().bankConsentForm,
    });

  });

  it('should emit the formGroup value when submit is called', () => {

    const submittedEmit = jest.spyOn(component.submitted, 'emit');

    component.ngOnInit();
    component.onSubmit();

    expect(submittedEmit).toHaveBeenCalledWith({
      mitIdForm: paymentFormFixture().mitIdForm,
      skatIdForm: paymentFormFixture().skatIdForm,
      bankConsentForm: paymentFormFixture().bankConsentForm,
    });

  });

});
