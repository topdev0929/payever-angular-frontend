import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { StatusIconComponent } from '../status-icon/status-icon.component';

import { DefaultReceiptComponent } from './default-receipt.component';

describe('default-receipt', () => {
  let component: DefaultReceiptComponent;
  let fixture: ComponentFixture<DefaultReceiptComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DefaultReceiptComponent, StatusIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DefaultReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });

    it('should load icons', () => {
      const loadIcons = jest.fn();
      (window as any).PayeverStatic = {
        SvgIconsLoader: {
          loadIcons: loadIcons,
        },
      };
      fixture.destroy();
      fixture = TestBed.createComponent(DefaultReceiptComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(loadIcons).toHaveBeenCalled();
    });
  });

  describe('isStatusSuccess', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isStatusSuccess', true);
      fixture.componentRef.setInput('orderId', 'orderId');
      fixture.detectChanges();
    });

    it('should render status case', () => {
      expect(fixture.debugElement.query(By.directive(StatusIconComponent)).componentInstance.status).toEqual('success');
      expect(fixture.debugElement.query(By.css('.large-1')).nativeElement.textContent).toContain(
        'checkout_sdk.default_receipt.finish.order_success.title'
      );
      expect(fixture.debugElement.query(By.css('.order-number-wrap')).nativeElement).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.caption-2')).nativeElement.textContent).toContain(
        'checkout_sdk.default_receipt.finish.labels.order_number'
      );
      expect(fixture.debugElement.query(By.css('strong')).nativeElement.textContent).toContain('orderId');
    });
  });

  describe('isStatusFail', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isStatusFail', true);
      fixture.detectChanges();
    });

    it('should render fail case', () => {
      expect(fixture.debugElement.query(By.directive(StatusIconComponent)).componentInstance.status).toEqual('fail');
      expect(fixture.debugElement.query(By.css('.large-1')).nativeElement.textContent).toContain(
        'checkout_sdk.default_receipt.finish.order_fail.title'
      );
    });
  });

  describe('isStatusUnknown', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isStatusUnknown', true);
      fixture.detectChanges();
    });

    it('should render fail case', () => {
      expect(fixture.debugElement.query(By.css('use')).nativeElement.getAttribute('xlink:href')).toEqual(
        '#icon-error-128'
      );
      expect(fixture.debugElement.query(By.css('.large-1')).nativeElement.textContent).toContain(
        'checkout_sdk.default_receipt.finish.order_unknown.title'
      );
      expect(fixture.debugElement.queryAll(By.css('p'))[1].nativeElement.textContent).toContain(
        'checkout_sdk.default_receipt.finish.order_unknown.text'
      );
    });
  });
});
