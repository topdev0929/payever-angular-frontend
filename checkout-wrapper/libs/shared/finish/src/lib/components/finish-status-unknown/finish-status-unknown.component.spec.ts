import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';

import { StatusIconComponent } from '../status-icon/status-icon.component';

import { FinishStatusUnknownComponent } from './finish-status-unknown.component';

describe('checkout-sdk-finish-status-unknown', () => {
  let component: FinishStatusUnknownComponent;
  let fixture: ComponentFixture<FinishStatusUnknownComponent>;

  const orderId = 'order-id';
  const applicationNumber = 'application-number';
  const transactionLink = 'transaction-link';
  const transactionNumber = 'order-id';
  const nodeResult = {
    payment: {
      status: PaymentStatusEnum.STATUS_CANCELLED,
      specificStatus: PaymentSpecificStatusEnum.NEED_MORE_INFO,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [...CommonProvidersTestHelper()],
      declarations: [FinishStatusUnknownComponent, StatusIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FinishStatusUnknownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  const initComponent = () => {
    fixture.componentRef.setInput('orderId', orderId);
    fixture.componentRef.setInput('applicationNumber', applicationNumber);
    fixture.componentRef.setInput('transactionLink', transactionLink);
    fixture.componentRef.setInput('transactionNumber', transactionNumber);
    fixture.componentRef.setInput('nodeResult', nodeResult);
    fixture.detectChanges();
  };

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should prepare translation on change inputs', () => {
    jest.spyOn(component, 'prepareTranslations');
    initComponent();
    expect(component.prepareTranslations).toHaveBeenCalled();
  });

  it('should render content', () => {
    initComponent();
    expect(fixture.debugElement.query(By.directive(StatusIconComponent)).componentInstance.status).toEqual('fail');
    expect(fixture.debugElement.query(By.css('.large-1')).nativeElement.textContent).toContain(
      'checkout_sdk.finish_status_unknown.title'
    );
    expect(fixture.debugElement.query(By.css('.caption-1')).nativeElement.textContent).toContain(
      'checkout_sdk.finish_status_unknown.text'
    );
    expect(fixture.debugElement.queryAll(By.css('p'))[3].nativeElement.textContent).toContain(applicationNumber);
    expect(fixture.debugElement.queryAll(By.css('p'))[4].nativeElement.textContent).toContain(transactionNumber);
    expect(fixture.debugElement.queryAll(By.css('p'))[5].nativeElement.textContent).toContain(transactionLink);
  });

  it('should render order-number', () => {
    initComponent();
    expect(fixture.debugElement.query(By.css('.order-number-wrap'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('div.text-secondary')).nativeElement.textContent).toContain(
      'checkout_sdk.default_receipt.finish.labels.order_number'
    );
    expect(fixture.debugElement.queryAll(By.css('div'))[2].nativeElement.textContent).toEqual(orderId);

    fixture.componentRef.setInput('orderId', null);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.order-number-wrap'))).toBeNull();
  });

  it('should render status', () => {
    initComponent();
    expect(fixture.debugElement.query(By.css('.status-debug')).nativeElement.textContent).toEqual(
      `${nodeResult?.payment.status}: ${nodeResult?.payment.specificStatus}`
    );
  });
});
