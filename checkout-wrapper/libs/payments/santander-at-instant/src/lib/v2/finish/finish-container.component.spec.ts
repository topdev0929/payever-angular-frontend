import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { PaymentService, FinishComponent } from '../../shared';
import { flowWithPaymentOptionsFixture } from '../../test';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {
  const storeHelper = new StoreHelper();
  const responseMock = {
    payment: {},
  } as NodePaymentResponseInterface<any>;

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;
  let store: Store;
  let nodeFlowService: NodeFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        FinishComponent,
        FinishContainerComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ...FinishProvidersTestHelper(),
        { provide: PaymentInquiryStorage, useValue: {} },
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
      ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
    nodeFlowService = TestBed.inject(NodeFlowService);

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;
    component.paymentResponse = responseMock;

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });


  it('should show finish modal from existing payment', () => {
    const superMethodSpy = jest.spyOn(
      AbstractFinishContainerComponent.prototype as any,
      'showFinishModalFromExistingPayment'
    );

    component.asSinglePayment = true;

    const getFinalResponseSpy = jest
      .spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(responseMock);

    jest.spyOn(component['nodeFlowService'], 'updatePayment')
      .mockReturnValue(of(responseMock));

    component.showFinishModalFromExistingPayment();

    fixture.detectChanges();

    expect(superMethodSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).toHaveBeenCalledTimes(1);
    expect(component.paymentResponse).toBeTruthy();
    expect(component.errorMessage).toBeFalsy();
  });

  it('should handle error when getting payment', () => {
    component.asSinglePayment = true;
    fixture.detectChanges();

    const getFinalResponseSpy = jest
      .spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(responseMock);

    jest.spyOn(component['nodeFlowService'], 'updatePayment')
      .mockReturnValue(throwError({ message: '' }));


    component.showFinishModalFromExistingPayment();

    fixture.detectChanges();

    expect(getFinalResponseSpy).toHaveBeenCalledTimes(1);
  });
});
