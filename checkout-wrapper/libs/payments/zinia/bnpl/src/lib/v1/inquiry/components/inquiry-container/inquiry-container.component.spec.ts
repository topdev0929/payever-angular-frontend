import { CommonModule } from '@angular/common';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  PatchFlow,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { FlowStateEnum } from '@pe/checkout/types';

import { BaseInquiryContainerComponent } from '../../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { PaymentService } from '../../../services';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('zinia-bnpl-inquiry-container', () => {
  let fixture: ComponentFixture<InquiryContainerComponent>;
  let component: InquiryContainerComponent;

  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CommonModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        InquiryContainerComponent,
        AddressStorageService,
        PaymentInquiryStorage,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
        { provide: ComponentFixtureAutoDetect, useValue: true },
      ],
      declarations: [
        InquiryContainerComponent,
      ],
    });
    fixture = TestBed.createComponent(InquiryContainerComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    component.ngOnInit();
  });

  afterEach(() => {
    jest.resetAllMocks();
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
