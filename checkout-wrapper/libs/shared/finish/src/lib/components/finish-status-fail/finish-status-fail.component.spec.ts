import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { StatusIconComponent } from '../status-icon/status-icon.component';

import { FinishStatusFailComponent } from './finish-status-fail.component';

describe('checkout-sdk-finish-status-fail', () => {
  let component: FinishStatusFailComponent;
  let fixture: ComponentFixture<FinishStatusFailComponent>;

  const applicationNumber = 'application-number';
  const transactionLink = 'transaction-link';
  const transactionNumber = 'order-id';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [...CommonProvidersTestHelper()],
      declarations: [FinishStatusFailComponent, StatusIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FinishStatusFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  const initComponent = () => {
    fixture.componentRef.setInput('title', true);
    fixture.componentRef.setInput('text', true);
    fixture.componentRef.setInput('applicationNumber', applicationNumber);
    fixture.componentRef.setInput('transactionLink', transactionLink);
    fixture.componentRef.setInput('transactionNumber', transactionNumber);
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

  it('should render icon', () => {
    initComponent();
    expect(fixture.debugElement.query(By.directive(StatusIconComponent)).componentInstance.status).toEqual('fail');
  });

  it('should render default text', () => {
    fixture.componentRef.setInput('title', true);
    fixture.componentRef.setInput('text', true);
    initComponent();
    expect(fixture.debugElement.query(By.css('.large-1')).nativeElement.textContent).toContain(
      'checkout_sdk.finish_status_fail.title'
    );
    expect(fixture.debugElement.query(By.css('.caption-1')).nativeElement.textContent).toContain(
      'checkout_sdk.finish_status_fail.text'
    );
  });

  it('should render custom text', () => {
    fixture.componentRef.setInput('title', 'title');
    fixture.componentRef.setInput('text', 'text');
    initComponent();
    expect(fixture.debugElement.query(By.css('.large-1')).nativeElement.textContent).toContain('title');
    expect(fixture.debugElement.query(By.css('.caption-1')).nativeElement.textContent).toContain('text');
  });

  it('should render change payment', () => {
    initComponent();
    fixture.componentRef.setInput('canChangePaymentMethod', false);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.text-secondary'))[0].nativeElement.textContent).not.toContain(
      'checkout_sdk.finish_status_fail.change_payment_method'
    );
    fixture.componentRef.setInput('canChangePaymentMethod', true);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.text-secondary'))[0].nativeElement.textContent).toContain(
      'checkout_sdk.finish_status_fail.change_payment_method'
    );
  });

  it('should render text-secondary', () => {
    initComponent();
    expect(fixture.debugElement.queryAll(By.css('.text-secondary'))[0].nativeElement.textContent).toContain(
      applicationNumber
    );
    expect(fixture.debugElement.queryAll(By.css('.text-secondary'))[1].nativeElement.textContent).toContain(
      transactionLink
    );
    expect(fixture.debugElement.queryAll(By.css('.text-secondary'))[2].nativeElement.textContent).toContain(
      transactionNumber
    );
  });
});
