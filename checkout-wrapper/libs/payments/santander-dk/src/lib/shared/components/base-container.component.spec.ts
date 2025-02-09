import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../test';

import { BaseContainerComponent } from './base-container.component';

@Component({
  selector: '',
  template: '',
})
class TestComponent extends BaseContainerComponent {
}

describe('BaseContainerComponent', () => {

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;

  const analyticsFormService = {
    initPaymentMethod: jest.fn(),
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        AddressStorageService,
        NodeFlowService,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
        { provide: AnalyticsFormService, useValue: analyticsFormService },
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    nodeFlowService = TestBed.inject(NodeFlowService);

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });


  it('should return null on getPaymentUrl', () => {

    expect(component['getPaymentUrl']()).toBeNull();

  });

  it('should do nothing on post payment success', () => {

    expect(component['onPostPaymentSuccess']()).toBeUndefined();

  });

  it('should return is pos false', () => {

    expect(component.isPos).toBe(false);

  });

  it('should set nodeResult on init', () => {

    const mockResponse: any = { payment: 'mock-payment' };
    jest.spyOn(nodeFlowService, 'getFinalResponse').mockReturnValue(mockResponse);

    component.nodeResult = null;

    expect(component.nodeResult).toBeNull();

    component.ngOnInit();

    expect(component.nodeResult).toEqual(mockResponse);

  });

});
