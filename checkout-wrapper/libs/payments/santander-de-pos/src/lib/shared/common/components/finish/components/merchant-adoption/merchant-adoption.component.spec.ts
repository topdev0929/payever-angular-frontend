import { ChangeDetectorRef, ElementRef, Renderer2 } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { FinishStatusIconConfig } from '@pe/checkout/finish';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
} from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, nodeResultFixture } from '../../../../../../test';
import { MerchantStylesComponent } from '../merchant-styles/merchant-styles.component';

import { MerchantAdoptionComponent } from './merchant-adoption.component';

describe('MerchantAdoptionComponent', () => {
  let component: MerchantAdoptionComponent;
  let fixture: ComponentFixture<MerchantAdoptionComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        MerchantStylesComponent,
        MerchantAdoptionComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ChangeDetectorRef,
        Renderer2,
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

    fixture = TestBed.createComponent(MerchantAdoptionComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    component.nodeResult = nodeResultFixture();
    component.errorMessage = '';

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });

  describe('contractBox', () => {
    it('should set contractBoxRef and handle click event', () => {
      const mockElementRef: ElementRef<HTMLElement> = new ElementRef(document.createElement('div'));

      const mockTagA: HTMLElement = document.createElement('a');
      mockElementRef.nativeElement = {
        children: [mockTagA],
      } as any;

      jest.spyOn(component['cdr'], 'detectChanges');
      jest.spyOn(component['renderer'], 'removeAttribute');
      jest.spyOn(component['renderer'], 'setAttribute');
      jest.spyOn(component['renderer'], 'listen')
        .mockImplementation(((e: any, t: string, callback: () => void) => callback()) as any);

      jest.spyOn(component, 'prepareContractLink').mockReturnValue('mockContractLink');

      component['setContractBox'] = mockElementRef;

      expect(component.contractBoxRef).toEqual(mockElementRef);

      component['isCustomerSending$'].next(true);
      expect(component['renderer'].removeAttribute).toHaveBeenCalledWith(mockTagA, 'href');

      component['isCustomerSending$'].next(false);
      expect(component['renderer'].setAttribute).toHaveBeenCalledWith(mockTagA, 'href', 'mockContractLink');

      expect(component.isContractDownloaded).toBeTruthy();
      expect(component['cdr'].detectChanges).toHaveBeenCalled();
    });
  });

  describe('isGuarantor', () => {
    it('should return true when guarantorType is not NONE', () => {
      component.nodeResult = {
        paymentDetails: {
          guarantorType: 'SOME_VALUE',
        },
      } as NodePaymentResponseInterface<any>;

      const result = component.isGuarantor;

      expect(result).toBeTruthy();
    });

    it('should return false when guarantorType is NONE', () => {
      component.nodeResult = {
        paymentDetails: {
          guarantorType: 'NONE',
        },
      } as NodePaymentResponseInterface<any>;

      const result = component.isGuarantor;

      expect(result).toBeFalsy();
    });
  });

  describe('hideSigning', () => {
    it('should return true when in edit mode, not sending payment signing link, and conditions are met', () => {
      component.isEditMode = true;
      component['params'].sendingPaymentSigningLink = false;
      component.nodeResult = {
        paymentDetails: {
          isCustomerSigningTriggered: true,
          isGuarantorSigningTriggered: false,
          isFullySigned: true,
        },
      } as NodePaymentResponseInterface<any>;

      const result = component.hideSigning;

      expect(result).toBeTruthy();
    });

    it('should return true if isGuarantorSigningTriggered true and isCustomerSigningTriggered false', () => {
      component.isEditMode = true;
      component['params'].sendingPaymentSigningLink = false;
      component.nodeResult = {
        paymentDetails: {
          isCustomerSigningTriggered: false,
          isGuarantorSigningTriggered: true,
          isFullySigned: true,
        },
      } as NodePaymentResponseInterface<any>;

      const result = component.hideSigning;

      expect(result).toBeTruthy();
    });

    it('should return true if customerSigned true and guarantorSigned false', () => {
      component.isEditMode = true;
      component['params'].sendingPaymentSigningLink = false;
      component.nodeResult = {
        paymentDetails: {
          isCustomerSigningTriggered: false,
          isGuarantorSigningTriggered: false,
          customerSigned: true,
          guarantorSigned: false,
          isFullySigned: true,
        },
      } as NodePaymentResponseInterface<any>;

      const result = component.hideSigning;

      expect(result).toBeTruthy();
    });

    it('should return true if guarantorSigned true and customerSigned false', () => {
      component.isEditMode = true;
      component['params'].sendingPaymentSigningLink = false;
      component.nodeResult = {
        paymentDetails: {
          isCustomerSigningTriggered: false,
          isGuarantorSigningTriggered: false,
          customerSigned: false,
          guarantorSigned: true,
          isFullySigned: true,
        },
      } as NodePaymentResponseInterface<any>;

      const result = component.hideSigning;

      expect(result).toBeTruthy();
    });

    it('should return true if customerSigningLink false and isCustomerSigningTriggered true', () => {
      component.isEditMode = true;
      component['params'].sendingPaymentSigningLink = false;
      component.nodeResult = {
        paymentDetails: {
          isCustomerSigningTriggered: true,
          isGuarantorSigningTriggered: false,
          customerSigned: false,
          guarantorSigned: false,
          customerSigningLink: false,
          isFullySigned: false,
        },
      } as NodePaymentResponseInterface<any>;

      const result = component.hideSigning;

      expect(result).toBeTruthy();
    });

    it('should return false when conditions for hiding are not met', () => {
      component.isEditMode = false;
      component['params'].sendingPaymentSigningLink = true;
      component.nodeResult = {
        paymentDetails: {
          isCustomerSigningTriggered: false,
          isGuarantorSigningTriggered: true,
          isFullySigned: false,
        },
      } as NodePaymentResponseInterface<any>;

      const result = component.hideSigning;

      expect(result).toBeFalsy();
    });
  });

  describe('ngOnChanges', () => {
    it('should update contractHtml when flow and nodeResult change', () => {
      component.ngOnChanges({
        flow: {
          currentValue: {},
          previousValue: null,
          isFirstChange: () => true,
          firstChange: true,
        },
        nodeResult: {
          currentValue: {},
          previousValue: null,
          isFirstChange: () => true,
          firstChange: true,
        },
      });

      const expectedContractHtml =
        '/api/download-resource/business/undefined/integration/santander_pos_installment/action/offline-signing';
      expect(component.contractHtml).toEqual(expect.stringContaining(expectedContractHtml));
    });
  });

  describe('sendCustomerSigningLink', () => {
    it('should send customer signing link and update state on success', fakeAsync(() => {
      const mockData = {
        payment: {},
        paymentDetails: {
          customerSigned: false,
          customerSigningLink: 'mockSigningLink',
        },
      } as NodePaymentResponseInterface<any>;
      component.nodeResult = mockData;

      jest.spyOn(component['cdr'], 'detectChanges');
      jest.spyOn(component['santanderDePosFlowService'], 'postPaymentActionSimple').mockReturnValue(of(mockData));
      jest.spyOn(component as any, 'runUpdatePayment').mockImplementation(jest.fn());
      jest.spyOn(component as any, 'saveDataBeforeRedirect').mockImplementation(jest.fn());

      component.sendCustomerSigningLink();

      tick();

      expect(component.isCustomerSended).toBe(true);
      expect(component['runUpdatePayment']).toHaveBeenCalledWith('customerSigned');
      expect(component['saveDataBeforeRedirect']).toHaveBeenCalled();
      expect(component.customerSigningLink$.value).toBe('mockSigningLink');
    }));

    it('should handle errors and update state on failure', () => {
      const mockError = new Error('Mock error');
      const mockData = {
        payment: {},
        paymentDetails: {
          customerSigned: false,
          customerSigningLink: 'mockSigningLink',
        },
      } as NodePaymentResponseInterface<any>;
      component.nodeResult = mockData;

      jest.spyOn(component['cdr'], 'detectChanges');
      jest.spyOn(component['santanderDePosFlowService'], 'postPaymentActionSimple')
        .mockReturnValue(throwError(mockError));

      component['santanderDePosFlowService'].postPaymentActionSimple(
          'start-signing-customer'
      ).subscribe({
        next: () => {
          expect(component.isCustomerSended).toBe(false);
          expect(component.errorMessage).toBe('Mock error');
          expect(component.isCustomerSending$.value).toBe(false);
          expect(component['cdr'].detectChanges).toHaveBeenCalled();
        },
      });

      component.sendCustomerSigningLink();


    });

    it('should run updatePayment when customer is already signed', () => {
      const mockData = {
        paymentDetails: {
          customerSigned: true,
          customerSigningLink: 'mockSigningLink',
        },
        payment: {},
      } as NodePaymentResponseInterface<any>;
      component.nodeResult = mockData;

      jest.spyOn(component as any, 'runUpdatePayment');

      component.sendCustomerSigningLink();

      expect(component['runUpdatePayment']).toHaveBeenCalledWith('customerSigned');
      expect(component.isCustomerSended).toBe(false);
      expect(component.errorMessage).toBe(null);
      expect(component.customerSigningLink$.value).toBe(null);
    });
  });

  describe('isSigned', () => {
    it('should return true if the specified field is signed', () => {
      const mockData = {
        paymentDetails: {
          someField: true,
          anotherField: false,
        },
        payment: {},
      } as NodePaymentResponseInterface<any>;
      component.nodeResult = mockData;

      const result = component.isSigned('someField');

      expect(result).toBe(true);
    });

    it('should return false if the specified field is not signed', () => {
      const mockData = {
        paymentDetails: {
          someField: true,
          anotherField: false,
        },
        payment: {},
      } as NodePaymentResponseInterface<any>;
      component.nodeResult = mockData;

      const result = component.isSigned('anotherField');

      expect(result).toBeFalsy();
    });

    it('should return false if the specified field is not present in paymentDetails', () => {
      const mockData = {
        paymentDetails: {
          someField: true,
          anotherField: false,
        },
        payment: {},
      } as NodePaymentResponseInterface<any>;
      component.nodeResult = mockData;

      const result = component.isSigned('nonExistentField');

      expect(result).toBeFalsy();
    });
  });

  describe('sendGuarantorSigningLink', () => {
    it('should send guarantor signing link and update payment when guarantor is not signed', (done) => {
      const mockData = {
        paymentDetails: {
          guarantorSigned: false,
        },
        payment: {},
      } as NodePaymentResponseInterface<any>;
      component.nodeResult = mockData;

      jest.spyOn(component['santanderDePosFlowService'], 'postPaymentActionSimple').mockReturnValue(of({
        paymentDetails: {
          guarantorSigningLink: 'mockGuarantorSigningLink',
        },
        payment: {},
      } as NodePaymentResponseInterface<any>));

      jest.spyOn(component as any, 'runUpdatePayment').mockImplementation(jest.fn());
      jest.spyOn(component as any, 'saveDataBeforeRedirect').mockImplementation(jest.fn());

      component.sendGuarantorSigningLink();

      component.guarantorSigningLink$.subscribe(() => {
        expect(component.isGuarantorSended).toBe(true);
        expect(component['runUpdatePayment']).toHaveBeenCalledWith('guarantorSigned');
        expect(component['saveDataBeforeRedirect']).toHaveBeenCalled();
        done();
      });
    });

    it('should handle postPaymentActionSimple error', fakeAsync(() => {
      const mockData = {
        paymentDetails: {
          guarantorSigned: false,
        },
        payment: {},
      } as NodePaymentResponseInterface<any>;
      const error = new Error('Test Error');
      component.nodeResult = mockData;

      jest.spyOn(component['santanderDePosFlowService'], 'postPaymentActionSimple')
        .mockReturnValue(throwError(error));

      jest.spyOn(component as any, 'runUpdatePayment').mockImplementation(jest.fn());
      jest.spyOn(component as any, 'saveDataBeforeRedirect').mockImplementation(jest.fn());
      const guarantorSigningLinkNext = jest.spyOn(component.guarantorSigningLink$, 'next');
      const isGuarantorSendingNext = jest.spyOn(component.isGuarantorSending$, 'next');
      try {
        component.sendGuarantorSigningLink();
        tick();
      } catch (err: any) {
        expect(err).toEqual(error);
        expect(isGuarantorSendingNext).toHaveBeenCalledWith(false);
        expect(guarantorSigningLinkNext).not.toHaveBeenCalled();
        expect(component['runUpdatePayment']).not.toHaveBeenCalled();
        expect(component['saveDataBeforeRedirect']).not.toHaveBeenCalled();
      }
    }));

    it('should not send guarantor signing link when guarantor is already signed', () => {
      const mockData = {
        paymentDetails: {
          guarantorSigned: true,
        },
        payment: {},
      } as NodePaymentResponseInterface<any>;
      component.nodeResult = mockData;

      jest.spyOn(component['santanderDePosFlowService'], 'postPaymentActionSimple');

      jest.spyOn(component as any, 'runUpdatePayment').mockImplementation(jest.fn());
      jest.spyOn(component as any, 'saveDataBeforeRedirect').mockImplementation(jest.fn());

      component.sendGuarantorSigningLink();

      expect(component.isGuarantorSended).toBe(false);
      expect(component['runUpdatePayment']).toHaveBeenCalledWith('guarantorSigned');
      expect(component['saveDataBeforeRedirect']).not.toHaveBeenCalled();
    });
  });

  describe('saveDataBeforeRedirect', () => {
    it('should save data before redirect', (done) => {
      const mockFlow = { id: 'mockFlowId' };
      component.flow = {};
      jest.spyOn(component['externalRedirectStorage'], 'saveDataBeforeRedirect');
      jest.spyOn(component['apiService'], '_getFlow').mockReturnValue(of(mockFlow));

      component['saveDataBeforeRedirect']();

      component['apiService']._getFlow('flowId').subscribe(() => {
        expect(component['externalRedirectStorage'].saveDataBeforeRedirect).toHaveBeenCalledWith(mockFlow);
        done();
      });
    });
  });

  describe('runUpdatePayment', () => {
    it('should run update payment', fakeAsync(() => {
      const fieldName = 'guarantorSigned';
      const mockNodePaymentResponse = {
        paymentDetails: { [fieldName]: true },
        payment: {},
      } as NodePaymentResponseInterface<any>;
      jest.spyOn(component['nodeFlowService'], 'updatePayment').mockReturnValue(of(mockNodePaymentResponse));
      jest.spyOn(component, 'isAccepted', 'get').mockReturnValue(false);
      jest.spyOn(component['isCustomerSending$'], 'next');
      jest.spyOn(component['isGuarantorSending$'], 'next');

      component['runUpdatePayment'](fieldName);

      tick(100000);

      expect(component.isCustomerSending$.next).toHaveBeenCalledWith(false);
      expect(component.isGuarantorSending$.next).toHaveBeenCalledWith(false);
    }));

    it('should run update payment handle error', fakeAsync(() => {
      const fieldName = 'guarantorSigned';
      const error = new Error('test error');
      jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockReturnValue(throwError(error));
      jest.spyOn(component, 'isAccepted', 'get').mockReturnValue(false);
      jest.spyOn(component['isCustomerSending$'], 'next');
      jest.spyOn(component['isGuarantorSending$'], 'next');

      try {
        component['runUpdatePayment'](fieldName);
        tick(100000);
      } catch (err: any) {
        expect(err).toEqual(error);
        expect(component.errorMessage).toEqual(error.message);
        expect(component.isCustomerSending$.next).not.toHaveBeenCalled();
        expect(component.isGuarantorSending$.next).not.toHaveBeenCalled();
      }
    }));

    it('should run update payment handle unknown error', fakeAsync(() => {
      const fieldName = 'guarantorSigned';
      const error = new Error();
      jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockReturnValue(throwError(error));
      jest.spyOn(component, 'isAccepted', 'get').mockReturnValue(false);
      jest.spyOn(component['isCustomerSending$'], 'next');
      jest.spyOn(component['isGuarantorSending$'], 'next');

      try {
        component['runUpdatePayment'](fieldName);
        tick(100000);
      } catch (err: any) {
        expect(err).toEqual(error);
        expect(component.errorMessage).toEqual('Unknown error!');
        expect(component.isCustomerSending$.next).not.toHaveBeenCalled();
        expect(component.isGuarantorSending$.next).not.toHaveBeenCalled();
      }
    }));
  });
});
