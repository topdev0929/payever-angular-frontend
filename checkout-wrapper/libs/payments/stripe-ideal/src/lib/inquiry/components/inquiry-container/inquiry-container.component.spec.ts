import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { of } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { ChooseRateComponent } from '@pe/checkout/rates';
import { AddressStorageService, FlowStorage, PaymentInquiryStorage } from '@pe/checkout/storage';
import { FlowState, PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { StripeIdealInquiryModule } from '../../stripe-ideal-inquire.module';

import { InquiryContainerComponent } from './inquiry-container.component';


describe('stripe-ideal-inquiry-container', () => {
  let store: Store;
  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: ApiService, useValue: {
            _patchFlow: jest.fn().mockImplementation((_, data) => of(data)),
          },
        },
        importProvidersFrom(StripeIdealInquiryModule),
        PaymentInquiryStorage,
        AddressStorageService,
        ApiService,
      ],
      declarations: [
        MockComponents(ChooseRateComponent),
        InquiryContainerComponent,
      ],
    });

    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(InquiryContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });


  describe('component', () => {
    it('should set proper inputs on ChooseRateComponent', () => {
      component.bankSelected('bank1');
      const flow = store.selectSnapshot(FlowState.flow);
      const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);
      store.dispatch(new SetPayments({
        [PaymentMethodEnum.STRIPE_IDEAL]: {
          [flowWithPaymentOptionsFixture().connectionId]: {
            ...store.selectSnapshot(PaymentState),
            formOptions: {
              idealBanks: [{ value: 'bank1', label: 'bank1' }],
            },
          },
        },
      }));

      fixture.detectChanges();

      const { child } = QueryChildByDirective(fixture, ChooseRateComponent);
      expect(child.trackFlowId).toEqual(flow.id);
      expect(child.trackPaymentMethod).toEqual(paymentMethod);
      expect(child.rates).toEqual([{
        id: 'bank1',
        svgIconUrl: `${component['env'].custom.cdn}/icons-ideal/bank1.svg`,
        title: 'bank1',
      }]);
      expect(child.initialRateId).toEqual('bank1');
    });

    it('should triggerSubmit', () => {
      const getData = jest.spyOn(FlowStorage.prototype, 'getData')
        .mockReturnValue('some truthy value');
      const spy = jest.spyOn(component.continue, 'emit');
      component.triggerSubmit();
      expect(spy).toHaveBeenCalled();
      expect(getData).toHaveBeenCalled();
    });

    it('should bankSelected on bankSelected event', () => {
      store.dispatch(new SetPayments({
        [PaymentMethodEnum.STRIPE_IDEAL]: {
          [flowWithPaymentOptionsFixture().connectionId]: {
            ...store.selectSnapshot(PaymentState),
            formOptions: {
              idealBanks: [{ value: 'bank1', label: 'bank1' }],
            },
          },
        },
      }));
      fixture.detectChanges();
      const { child } = QueryChildByDirective(fixture, ChooseRateComponent);
      const flow = store.selectSnapshot(FlowState.flow);
      const setData = jest.spyOn(FlowStorage.prototype, 'setData');
      const spy = jest.spyOn(component.buttonText, 'next');
      child.rateSelected.emit('selected rate');
      expect(spy).toHaveBeenCalled();
      expect(setData).toHaveBeenCalledWith(flow.id, 'idealBank', 'selected rate');
    });

  });
});
