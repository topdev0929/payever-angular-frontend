import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { PeDestroyService } from '@pe/destroy';

import { PaymentDetailsContainerComponent } from './payment-details-container.component';

describe('PaymentDetailsContainerComponent', () => {

  let component: PaymentDetailsContainerComponent;
  let fixture: ComponentFixture<PaymentDetailsContainerComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [PaymentDetailsContainerComponent],
      imports: [],
      providers: [
        { provide: Store, useValue: {} },
        { provide: NodeFlowService, useValue: {} },
        { provide: PeDestroyService, useValue: {} },
        { provide: AnalyticsFormService, useValue: {} },
        { provide: PaymentInquiryStorage, useValue: {} },
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentDetailsContainerComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should emit continue on init', () => {

    const continueEmitSpy = jest.spyOn(component.continue, 'emit');

    expect(continueEmitSpy).not.toHaveBeenCalled();

    component.ngOnInit();

    expect(continueEmitSpy).toHaveBeenCalled();

  });

});
