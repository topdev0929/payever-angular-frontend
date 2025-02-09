import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { PaymentService, RatesCalculationApiService, RatesCalculationService } from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test';
import { RatesInfoTableComponent } from '../rates-info-table/rates-info-table.component';

import { RatesViewContainerComponent } from './rates-view-container.component';

describe('RatesViewContainerComponent', () => {
  const storeHelper = new StoreHelper();

  let component: RatesViewContainerComponent;
  let fixture: ComponentFixture<RatesViewContainerComponent>;
  let store: Store;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
      ],
      declarations: [
        RatesInfoTableComponent,
        RatesViewContainerComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        RatesCalculationService,
        RatesCalculationApiService,
        AddressStorageService,
        NgControl,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
      ],
    });

    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatesViewContainerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor method', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });
});
