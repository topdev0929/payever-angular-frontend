import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetPayments, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { SharedModule } from '../../../shared';
import { flowWithPaymentOptionsFixture, paymentFormFixture, paymentOptionsFixture } from '../../../test';
import { RatesInfoTableComponent } from '../rates-info-table';

import { RatesViewContainerComponent } from './rates-view-container.component';

describe('RatesViewContainerComponent', () => {

  let component: RatesViewContainerComponent;
  let fixture: ComponentFixture<RatesViewContainerComponent>;

  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        RatesViewContainerComponent,
        RatesInfoTableComponent,
      ],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
        PaymentInquiryStorage,
        AddressStorageService,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: paymentFormFixture(),
          paymentOptions: paymentOptionsFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(RatesViewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should select initial data from store', (done) => {

    component.initialData$.subscribe((data) => {
      expect(data).toEqual(paymentFormFixture().ratesForm);
      done();
    });

  });

});
