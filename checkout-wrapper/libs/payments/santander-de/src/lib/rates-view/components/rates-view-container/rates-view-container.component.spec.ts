import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow, SetFormState, PatchPaymentDetails } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';

import { RatesInfoTableComponent } from '../../../shared/components';
import { PaymentService, SantanderDeApiService, SantanderDeFlowService } from '../../../shared/services';
import { flowWithPaymentOptionsFixture, rateFixture } from '../../../test';

import { RatesViewContainerComponent } from './rates-view-container.component';

describe('RatesViewContainerComponent', () => {
  const storeHelper = new StoreHelper();

  let component: RatesViewContainerComponent;
  let fixture: ComponentFixture<RatesViewContainerComponent>;
  let store: Store;
  const expectedFormData: any = {
    key: 'value',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: PaymentInquiryStorage, useValue: {} },
        AddressStorageService,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
        SantanderDeFlowService,
        SantanderDeApiService,
      ],
      declarations: [
        RatesInfoTableComponent,
        RatesViewContainerComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    store.dispatch(new SetFormState(expectedFormData));

    fixture = TestBed.createComponent(RatesViewContainerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  it('Should initialize the currency', () => {
    expect(component.currency).toEqual(component.flow.currency);
  });

  it('Should initialize the rate$', (done) => {
    store.dispatch(new PatchPaymentDetails({
      rate: rateFixture(),
    }));
    component.rate$.subscribe((rate) => {
      expect(rate).toEqual(rateFixture());
      done();
    });
  });

  it('Should initialize the formData', () => {
    expect(component.formData).toEqual(expectedFormData);
  });

  it('should paymentTitle return null if flow not found', () => {
    Object.defineProperty(component, 'flow', { writable: true });
    component.flow = null;
    expect(component.paymentTitle).toEqual(null);
  });
});
