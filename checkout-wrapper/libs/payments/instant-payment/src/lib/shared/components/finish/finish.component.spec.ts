import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';

import {
  FinishStatusFailComponent,
  FinishStatusSuccessComponent,
  FinishStatusUnknownComponent,
} from '@pe/checkout/finish/components';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  FinishProvidersTestHelper,
} from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';
import { CheckoutUiPaymentLogoModule } from '@pe/checkout/ui/payment-logo';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../../test';
import { nodeResultFixture } from '../../../test/fixtures/node-result.fixture';

import { FinishComponent } from './finish.component';

describe('FinishComponent', () => {
  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutUiPaymentLogoModule,
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        FinishComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ...FinishProvidersTestHelper(),
        {
          provide: LocaleConstantsService,
          useValue: {
            getLang: jest.fn().mockReturnValue('de-DE'),
          },
        },
      ],
    });
  });

  beforeEach(() => {
    registerLocaleData(de.default);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(FinishComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    component.nodeResult = nodeResultFixture();
    component.embeddedMode = true;
    component.isLoading = false;
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
    it('should return true if status is STATUS_ACCEPTED', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);

      expect(component.isStatusSuccess()).toBe(true);
    });

    it('should return true if status is STATUS_PAID', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_PAID);

      expect(component.isStatusSuccess()).toBe(true);
    });

    it('should return false for other statuses', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_IN_PROCESS);

      expect(component.isStatusSuccess()).toBe(false);
    });

    it('should render checkout-sdk-finish-status-success when status is success or pending', () => {
      jest.spyOn(component, 'isStatusSuccess').mockReturnValue(true);
      jest.spyOn(component, 'isStatusPending').mockReturnValue(true);
      fixture.componentRef.setInput('showTemplate', false);

      fixture.detectChanges();

      const successStatusElement = fixture.debugElement.query(By.directive(FinishStatusSuccessComponent));
      expect(successStatusElement).toBeTruthy();
    });
  });

  describe('isStatusPending', () => {

    it('should return true if status is STATUS_IN_PROCESS', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_IN_PROCESS);

      expect(component.isStatusPending()).toBe(true);
    });

    it('should return false for other statuses', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);

      expect(component.isStatusPending()).toBe(false);
    });
  });

  describe('isStatusFail', () => {

    it('should return true if status is STATUS_FAILED', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_FAILED);

      expect(component.isStatusFail()).toBe(true);
    });

    it('should return true if status is STATUS_DECLINED', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);

      expect(component.isStatusFail()).toBe(true);
    });

    it('should return false for other statuses', () => {
      jest.spyOn(component, 'getPaymentStatus')
        .mockReturnValue(PaymentStatusEnum.STATUS_PAID);

      expect(component.isStatusFail()).toBe(false);
    });

    it('should render checkout-sdk-finish-status-fail when status is fail', () => {
      jest.spyOn(component, 'isStatusFail').mockReturnValue(true);
      fixture.componentRef.setInput('showTemplate', false);

      fixture.detectChanges();

      const failStatusElement = fixture.debugElement.query(By.directive(FinishStatusFailComponent));
      expect(failStatusElement).toBeTruthy();
    });
  });

  it('should render ui-payment-logo when showTemplate is true', () => {
    fixture.componentRef.setInput('showTemplate', true);
    fixture.detectChanges();

    const logoElement = fixture.debugElement.query(By.css('.logo'));

    expect(logoElement).toBeTruthy();
  });

  it('should render checkout-sdk-finish-status-unknown when status is unknown', () => {
    jest.spyOn(component, 'isStatusUnknown').mockReturnValue(true);
    fixture.componentRef.setInput('showTemplate', false);

    fixture.detectChanges();

    const unknownStatusElement = fixture.debugElement.query(By.directive(FinishStatusUnknownComponent));
    expect(unknownStatusElement).toBeTruthy();
  });
});
