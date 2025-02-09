import { TestBed, ComponentFixture, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { FinishStatusIconConfig } from '@pe/checkout/finish';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
} from '@pe/checkout/testing';
import { NodePaymentResponseInterface, PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';
import { ProgressButtonContentComponent } from '@pe/checkout/ui/progress-button-content';

import { flowWithPaymentOptionsFixture } from '../../../../../../test';

import { SelfAdoptionComponent } from './self-adoption.component';

describe('SelfAdoptionComponent', () => {
  let component: SelfAdoptionComponent;
  let fixture: ComponentFixture<SelfAdoptionComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MatButtonModule,
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        ProgressButtonContentComponent,
        SelfAdoptionComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: FinishStatusIconConfig,
          useValue: {
            icons: {
              success: 'success-36',
              pending: 'pending-36',
              fail: 'error-36',
            },
            iconsClass: 'icon-36',
          },
        },
      ],
    });
  });

  beforeEach(() => {
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(SelfAdoptionComponent);
    component = fixture.componentInstance;
    component.flow = {};
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });

  describe('nodeResult', () => {
    it('should set nodeResult and call checkStatus', () => {
      const mockPayment = {
        payment: {},
      } as NodePaymentResponseInterface<any>;

      jest.spyOn(component as any, 'checkStatus');

      component.nodeResult = mockPayment;

      expect(component.nodeResult).toEqual(mockPayment);
      expect(component['checkStatus']).toHaveBeenCalled();
    });
  });

  describe('variables', () => {
    it('should return variables object with applicationNo', () => {
      const mockPayment = {
        paymentDetails: {
          applicationNo: 'mockApplicationNo',
        },
        payment: {},
      } as NodePaymentResponseInterface<any>;

      component.nodeResult = mockPayment;

      const variables = component.variables;

      expect(variables).toEqual({ applicationNo: 'mockApplicationNo' });
    });

    it('should return empty object if applicationNo is not present', () => {
      const mockPayment = {
        paymentDetails: {},
        payment: {},
      } as NodePaymentResponseInterface<any>;

      component.nodeResult = mockPayment;

      const variables = component.variables;

      expect(variables).toEqual({});
    });
  });

  describe('ngOnInit', () => {
    it('should call checkStatus on ngOnInit', () => {
      jest.spyOn(component as any, 'checkStatus').mockImplementation(jest.fn());

      component.ngOnInit();

      expect(component['checkStatus']).toHaveBeenCalled();
    });
  });
  describe('onSignNow', () => {
    it('should call ApiService, ExternalRedirectStorage, and update process on onSignNow', fakeAsync(() => {
      const mockFlow: any = { id: 'mockFlowId' };
      const mockNodeResult = {
        paymentDetails: {
          customerSigningLink: 'mockSigningLink',
        },
        payment: {},
      } as NodePaymentResponseInterface<any>;
      component.nodeResult = mockNodeResult;

      jest.spyOn(component['windowTopLocation'], 'href', 'set').mockImplementation(jest.fn());
      const _getFlowSpy = jest.spyOn(component['apiService'], '_getFlow').mockReturnValue(of(mockFlow));
      const saveDataBeforeRedirectSpy = jest.spyOn(component['externalRedirectStorage'], 'saveDataBeforeRedirect')
        .mockReturnValue(of(null));
      const event = new MouseEvent('click');

      component.onSignNow(event);

      tick();

      expect(_getFlowSpy).toHaveBeenCalledWith(component.flow.id);
      expect(saveDataBeforeRedirectSpy).toHaveBeenCalledWith(mockFlow);
      expect(component.updatingProcess$.value).toBeTruthy();
    }));

    it('should onSignNow handle error', fakeAsync(() => {
      const mockFlow: any = { id: 'mockFlowId' };
      const mockNodeResult = {
        paymentDetails: {
          customerSigningLink: 'mockSigningLink',
        },
        payment: {},
      } as NodePaymentResponseInterface<any>;
      component.nodeResult = mockNodeResult;
      const error = new Error('test');

      jest.spyOn(component['windowTopLocation'], 'href', 'set').mockImplementation(jest.fn());
      const _getFlowSpy = jest.spyOn(component['apiService'], '_getFlow')
        .mockReturnValue(of(mockFlow));
      const saveDataBeforeRedirectSpy = jest.spyOn(component['externalRedirectStorage'], 'saveDataBeforeRedirect')
        .mockReturnValue(throwError(error));
      const updatingProcessNext = jest.spyOn(component.updatingProcess$, 'next');
      const event = new MouseEvent('click');

      try {
        component.onSignNow(event);

        tick();
        expect(_getFlowSpy).toHaveBeenCalledWith(component.flow.id);
        expect(saveDataBeforeRedirectSpy).toHaveBeenCalledWith(mockFlow);
        expect(updatingProcessNext).toHaveBeenCalledWith(false);
        expect(component.updatingProcess$.value).toBeFalsy();
      } catch (err) {
        expect(err).toEqual(error);
      }
    }));
  });

  describe('runUpdatePayment', () => {

    it('should update payment and handle success case', fakeAsync(() => {
      const mockNodePaymentResponse = {
        payment: {},
      } as NodePaymentResponseInterface<any>;
      jest.spyOn(component['nodeFlowService'], 'updatePayment').mockReturnValue(of(mockNodePaymentResponse));
      jest.spyOn(component as any, 'checkStatus').mockImplementation(jest.fn());

      component.runUpdatePayment();

      tick(10000);
      discardPeriodicTasks();

      expect(component.nodeResult).toEqual(mockNodePaymentResponse);
      expect(component.errorMessage).toBeNull();
      expect(component.isTimeoutInApproved).toBeFalsy();
    }));

    it('should handle updatePayment error', fakeAsync(() => {
      const error = new Error('test');
      jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockReturnValue(throwError(error));
      jest.spyOn(component as any, 'checkStatus').mockImplementation(jest.fn());

      component.runUpdatePayment();

      tick(10000);
      discardPeriodicTasks();

      expect(component.nodeResult).toEqual(null);
      expect(component.errorMessage).toEqual(error.message);
      expect(component.isTimeoutInApproved).toBeFalsy();
    }));

    it('should updatePayment handle unknown error', fakeAsync(() => {
      const error = new Error();
      jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockReturnValue(throwError(error));
      jest.spyOn(component as any, 'checkStatus').mockImplementation(jest.fn());

      component.runUpdatePayment();

      tick(10000);
      discardPeriodicTasks();

      expect(component.nodeResult).toEqual(null);
      expect(component.errorMessage).toEqual('Unknown error!');
      expect(component.isTimeoutInApproved).toBeFalsy();
    }));

    it('should handle verify status', fakeAsync(() => {
      const mockNodePaymentResponse = {
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_VERIFIED,
        },
      } as NodePaymentResponseInterface<any>;
      jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockReturnValue(of(mockNodePaymentResponse));
      const checkStatus = jest.spyOn(component as any, 'checkStatus').mockImplementation(jest.fn());
      const updatingProcessNext = jest.spyOn(component.updatingProcess$, 'next');
      component.runUpdatePayment();

      tick(10000);
      discardPeriodicTasks();

      expect(component.nodeResult).toEqual(mockNodePaymentResponse);
      expect(checkStatus).toHaveBeenCalled();
      expect(updatingProcessNext).toHaveBeenCalledWith(false);
      expect(component.errorMessage).toBeNull();
      expect(component.isTimeoutInApproved).toBeFalsy();
    }));
  });

  describe('checkStatus', () => {
    it('should set step to 1', () => {
      component.nodeResult = {
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_IN_ENTSCHEIDUNG,
        },
        paymentDetails: {
          isVerified: false,
        },
      } as any;

      component['checkStatus']();

      expect(component.step).toEqual(1);
    });

    it('should set step to 2', () => {
      component.nodeResult = {
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_GENEHMIGT,
        },
        paymentDetails: {
          isVerified: true,
        },
      } as any;

      component.isInDecision = true;
      component.isTimeoutInApproved = false;

      component['checkStatus']();

      expect(component.step).toEqual(2);
    });

    it('should set step to 3', () => {
      component.nodeResult = {
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_SIGNED,
          status: PaymentStatusEnum.STATUS_ACCEPTED,
        },
        paymentDetails: {
          isVerified: false,
        },
      } as any;

      component['checkStatus']();

      expect(component.step).toEqual(3);
    });
  });
});
