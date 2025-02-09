import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { LAZY_PAYMENT_SECTIONS } from '@pe/checkout/form-utils';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { ChangeFailedPayment, PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { ChangePaymentDataInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { FormConfigService, SantanderNoFlowService } from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test';

import { InquiryContainerComponent } from './inquiry-container.component';


describe('InquiryContainerComponent', () => {
  const storeHelper = new StoreHelper();
  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;
  let store: Store;
  let santanderNoFlowService: SantanderNoFlowService;
  let nodeFlowService: NodeFlowService;
  let topLocationService: TopLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressStorageService,
        FormConfigService,
        SantanderNoFlowService,
        TopLocationService,
        NodeFlowService,
        { provide: PaymentInquiryStorage, useValue: {} },
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
        { provide: LAZY_PAYMENT_SECTIONS, useValue: {} },
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        InquiryContainerComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_NO]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
        },
      },
    }));
    santanderNoFlowService = TestBed.inject(SantanderNoFlowService);
    topLocationService = TestBed.inject(TopLocationService);
    nodeFlowService = TestBed.inject(NodeFlowService);

    fixture = TestBed.createComponent(InquiryContainerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });


  describe('Component', () => {
    it('should emit continue event after sending payment data', () => {
      jest.spyOn(store, 'selectSnapshot');
      jest.spyOn(component as any, 'sendPaymentData').mockReturnValue(of(undefined));
      jest.spyOn(component.continue, 'emit');

      component.onSend();

      expect(store.selectSnapshot).toHaveBeenCalledWith(PaymentState.form);
      expect(component['sendPaymentData']).toHaveBeenCalledWith(undefined);
      expect(component.continue.emit).toHaveBeenCalled();
    });

    it('should handle changePayment', () => {

      const data: ChangePaymentDataInterface = {
        redirectUrl: 'https://payever.org/redirect-url',
      };
      const dispatch = jest.spyOn(store, 'dispatch');

      component.changePayment(data);

      expect(dispatch).toHaveBeenCalledWith(new ChangeFailedPayment(data));

    });

    it('should trigger checkStepsLogic$ on checkStepsLogic', () => {

      const formSectionsData = [{
        name: 'name',
      }];
      const next = jest.spyOn(component.checkStepsLogic$, 'next');

      component.checkStepsLogic(formSectionsData);
      expect(next).toHaveBeenCalledWith(formSectionsData);

    });

    it('should trigger checkStepsLogic on loadedLazyModule', () => {

      const sectionData = [{
        name: 'name',
      }];
      const next = jest.spyOn(component.checkStepsLogic$, 'next');

      component.loadedLazyModule(sectionData);

      expect(next).toHaveBeenCalledWith(sectionData);

    });

    it('should call onSend on finishedModalShown call', () => {

      const onSend = jest.spyOn(component, 'onSend');
      jest.spyOn(santanderNoFlowService, 'isNeedApproval')
        .mockReturnValue(false);
      const setHrefSpy = jest.spyOn(topLocationService, 'href', 'set')
        .mockReturnValue(null);

      component.finishedModalShown();

      expect(onSend).toHaveBeenCalled();
      expect(setHrefSpy).not.toHaveBeenCalled();

    });

    it('should handle approve on finishedModalShown call', () => {

      component.nodeResult = {
        paymentDetails: {
          scoreResultRedirect: 'https://payever.org/score-result-redirect',
        },
      } as any;

      const onSend = jest.spyOn(component, 'onSend');
      jest.spyOn(santanderNoFlowService, 'isNeedApproval')
        .mockReturnValue(true);
      const setHrefSpy = jest.spyOn(topLocationService, 'href', 'set')
        .mockReturnValue(null);

      component.finishedModalShown();

      expect(setHrefSpy).toHaveBeenCalledWith('https://payever.org/score-result-redirect');
      expect(onSend).not.toHaveBeenCalled();

    });

    it('should set isPassedPaymentData false if isNeedApproval', () => {

      const getFinalResponse = jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue({ id: '1221213213' } as any);
      jest.spyOn(santanderNoFlowService, 'isNeedApproval')
        .mockReturnValue(true);

      component['showFinishModalFromExistingPayment']();

      expect(getFinalResponse).toHaveBeenCalled();
      expect(component['sectionStorageService'].isPassedPaymentData).toBeFalsy();

    });
  });

});
