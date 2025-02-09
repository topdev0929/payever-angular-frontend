
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { MockModule } from 'ng-mocks';
import { of } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { FinishModule } from '@pe/checkout/finish';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  PatchFlow,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { FlowStateEnum } from '@pe/checkout/types';

import { BaseInquiryContainerComponent } from '../../../../shared/components';
import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { ZiniaInstallmentsV1ChoosePaymentModule } from '../../inquiry.module';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('zinia-installments-choose-payment-container', () => {
  let store: Store;

  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MockModule(FinishModule),
        RouterModule.forRoot([]),
      ],
      providers: [
        importProvidersFrom(ZiniaInstallmentsV1ChoosePaymentModule),
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
      ],
      declarations: [
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
      expect(component instanceof BaseInquiryContainerComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('Should show errorMessages', async () => {
      component.errorMessage = 'Oops!';
      component.cdr.detectChanges();

      const p = fixture.debugElement.query(By.css('p'))?.nativeElement;
      expect(p).toBeTruthy();
      expect(p.innerHTML).toEqual(component.errorMessage);
    });
    it('Should emit continue on triggerSubmit', () => {
      const emitContinue = jest.spyOn(component.continue, 'next');
      component.triggerSubmit();
      expect(emitContinue).toBeCalledTimes(1);
    });

    it('Should check finish status isFlowHasFinishedPayment', () => {
      const apiService = TestBed.inject(ApiService);
      jest.spyOn(apiService, '_patchFlow')
        .mockImplementation((_, data) => of(data));
      expect(component.isFlowHasFinishedPayment()).toBe(false);

      store.dispatch(new PatchFlow({ state: FlowStateEnum.FINISH }));
      expect(component.isFlowHasFinishedPayment()).toBe(true);
    });
  });
});
