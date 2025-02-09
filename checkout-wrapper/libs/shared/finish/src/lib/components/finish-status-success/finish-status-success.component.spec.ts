import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import dayjs from 'dayjs';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { StatusIconComponent } from '../status-icon/status-icon.component';

import { FinishStatusSuccessComponent } from './finish-status-success.component';

describe('checkout-sdk-finish-status-success', () => {
  let component: FinishStatusSuccessComponent;
  let fixture: ComponentFixture<FinishStatusSuccessComponent>;

  const title = 'title';
  const text = 'text';
  const total = 1000;
  const currency = 'USD';
  const storeName = 'storeName';
  const createdAt = new Date();
  const billingAddressName = 'billingAddressName';
  const orderId = 'orderId';
  const applicationNumber = 'application-number';
  const transactionLink = 'transaction-link';
  const transactionNumber = 'order-id';
  const signingCenterLink = 'signingCenterLink';
  const contractUrl = 'contractUrl';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [...CommonProvidersTestHelper()],
      declarations: [FinishStatusSuccessComponent, StatusIconComponent],
      schemas: [],
    }).compileComponents();

    fixture = TestBed.createComponent(FinishStatusSuccessComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  const initComponent = () => {
    fixture.componentRef.setInput('title', title);
    fixture.componentRef.setInput('text', text);
    fixture.componentRef.setInput('total', total);
    fixture.componentRef.setInput('currency', currency);
    fixture.componentRef.setInput('storeName', storeName);
    fixture.componentRef.setInput('createdAt', createdAt);
    fixture.componentRef.setInput('billingAddressName', billingAddressName);
    fixture.componentRef.setInput('orderId', orderId);
    fixture.componentRef.setInput('signingCenterLink', signingCenterLink);
    fixture.componentRef.setInput('contractUrl', contractUrl);
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
    expect(fixture.debugElement.query(By.directive(StatusIconComponent)).componentInstance.status).toEqual('success');
  });

  it('should render default title and text', () => {
    fixture.componentRef.setInput('title', true);
    fixture.componentRef.setInput('text', true);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.large-1')).nativeElement.textContent).toContain(
      'checkout_sdk.finish_status_success.title'
    );
    expect(fixture.debugElement.query(By.css('.caption-1')).nativeElement.textContent).toContain(
      'checkout_sdk.finish_status_success.text'
    );
  });

  it('should render custom title and text', () => {
    initComponent();
    expect(fixture.debugElement.query(By.css('.large-1')).nativeElement.textContent).toContain(title);
    expect(fixture.debugElement.query(By.css('.caption-1')).nativeElement.textContent).toContain(text);
  });

  it('should render transaction info', () => {
    initComponent();
    expect(fixture.debugElement.queryAll(By.css('.text-secondary'))[0].nativeElement.textContent).toContain(
      applicationNumber
    );
    expect(fixture.debugElement.queryAll(By.css('.text-secondary'))[1].nativeElement.textContent).toContain(
      transactionNumber
    );
    expect(fixture.debugElement.queryAll(By.css('p'))[6].nativeElement.textContent).toContain(transactionLink);
  });

  it('should render details', () => {
    initComponent();
    expect(fixture.debugElement.queryAll(By.css('.pull-right'))[0].nativeElement.textContent).toContain('$1,000.00');
    expect(fixture.debugElement.queryAll(By.css('.pull-right'))[1].nativeElement.textContent).toContain(storeName);
    expect(fixture.debugElement.queryAll(By.css('.pull-right'))[2].nativeElement.textContent).toContain(
      dayjs(createdAt).format('DD.MM.YYYY HH:mm:ss')
    );
    expect(fixture.debugElement.queryAll(By.css('.pull-right'))[3].nativeElement.textContent).toContain(
      billingAddressName
    );
  });

  it('should render signingCenterLink', () => {
    initComponent();
    const link = fixture.debugElement.queryAll(By.css('a'))[0].nativeElement;
    expect(link.href).toContain(signingCenterLink);
    expect(link.target).toEqual('_blank');
    expect(link.textContent).toContain('checkout_sdk.finish_status_success.print_docs');
  });

  it('should render contractUrl', () => {
    initComponent();
    const link = fixture.debugElement.queryAll(By.css('a'))[1].nativeElement;
    expect(link.href).toContain(contractUrl);
    expect(link.target).toEqual('_blank');
    expect(link.textContent).toContain('checkout_sdk.finish_status_success.download_contract');
  });

  it('should render order-number', () => {
    initComponent();
    expect(fixture.debugElement.query(By.css('.order-number-wrap'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('div.text-secondary')).nativeElement.textContent).toContain(
      'checkout_sdk.default_receipt.finish.labels.order_number'
    );

    fixture.componentRef.setInput('orderId', null);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.order-number-wrap'))).toBeNull();
  });

  it('should show merchant text', () => {
    initComponent();
    const merchantText = 'merchantText';
    fixture.componentRef.setInput('isPosPayment', true);
    fixture.componentRef.setInput('merchantText', merchantText);
    fixture.detectChanges();

    const textElement = fixture.debugElement.queryAll(By.css('p'));
    expect(textElement[textElement.length - 1].nativeElement.textContent).toContain(merchantText);
  });
});
