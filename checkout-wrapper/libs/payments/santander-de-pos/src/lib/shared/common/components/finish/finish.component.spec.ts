import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';

import { FinishStatusIconConfig } from '@pe/checkout/finish';
import {
  FinishStatusSuccessComponent,
  FinishStatusUnknownComponent,
  PaymentExternalCodeComponent,
} from '@pe/checkout/finish/components';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  FinishProvidersTestHelper,
} from '@pe/checkout/testing';
import { PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, nodeResultFixture } from '../../../../test';

import { FinishStatusFailComponent } from './components/status-fail/status-fail.component';
import { FinishComponent } from './finish.component';

describe('FinishComponent', () => {
  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MatButtonModule,
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        FinishStatusFailComponent,
        PaymentExternalCodeComponent,
        FinishComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ...FinishProvidersTestHelper(),
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

    fixture = TestBed.createComponent(FinishComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    component.nodeResult = nodeResultFixture();
    component.embeddedMode = true;
    component.isLoading = true;
    component.isChangingPaymentMethod = false;
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

  describe('isStatusSuccess', () => {
    it('should return true for success status', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);

      expect(component.isStatusSuccess()).toBe(true);
    });

    it('should return false for other statuses', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);

      expect(component.isStatusSuccess()).toBe(false);
    });
  });

  describe('isMerchantStatusPending', () => {
    it('should return true for merchantStatusPending status', () => {
      component.merchantMode = true;
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_IN_PROCESS);
      jest.spyOn(component, 'isVerificationModalRequired')
        .mockReturnValue(false);

      expect(component.isMerchantStatusPending()).toBe(true);
    });

    it('should return false for other statuses', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);

      expect(component.isStatusPending()).toBe(false);
    });
  });


  describe('isVerificationModalRequired', () => {
    it('should return true for isVerificationModalRequired', () => {
      jest.spyOn(component, 'specificStatus', 'get')
        .mockReturnValue(PaymentSpecificStatusEnum.STATUS_GENEHMIGT);

      expect(component.isVerificationModalRequired()).toBe(true);
    });

    it('should return false for other statuses', () => {
      jest.spyOn(component, 'specificStatus', 'get')
        .mockReturnValue(PaymentSpecificStatusEnum.NEED_MORE_INFO_STUDENT_IIR);

      expect(component.isVerificationModalRequired()).toBe(false);
    });
  });

  describe('isStatusFail', () => {
    it('should return true for fail status', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);

      expect(component.isStatusFail()).toBe(true);
    });

    it('should return false for other statuses', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);

      expect(component.isStatusFail()).toBe(false);
    });
  });

  describe('Template', () => {
    it('should display success component for success status', () => {
      jest.spyOn(component, 'isCustomStatusSuccess')
        .mockReturnValue(true);
      fixture.componentRef.setInput('isLoading', false);

      fixture.detectChanges();

      const successComponent = fixture.debugElement.query(By.directive(FinishStatusSuccessComponent));

      expect(successComponent).toBeTruthy();
    });

    it('should display fail component for fail status', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);
      fixture.componentRef.setInput('isLoading', false);

      fixture.detectChanges();

      const failComponent = fixture.debugElement.query(By.directive(FinishStatusFailComponent));

      expect(failComponent).toBeTruthy();
    });

    it('should display unknown component for unknown status', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue('unknown_status' as PaymentStatusEnum);
      fixture.componentRef.setInput('isLoading', false);

      fixture.detectChanges();

      const unknownComponent = fixture.debugElement.query(By.directive(FinishStatusUnknownComponent));

      expect(unknownComponent).toBeTruthy();
    });
  });
});
