import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NonFormErrorsService } from '@pe/checkout/payment';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { ModalButtonInterface } from '../..//types';
import { FinishModule } from '../../finish.module';
import { StatusIconComponent } from '../status-icon/status-icon.component';

import { FinishWrapperComponent } from './finish-wrapper.component';

describe('checkout-sdk-finish-wrapper', () => {
  let component: FinishWrapperComponent;
  let fixture: ComponentFixture<FinishWrapperComponent>;

  const buttonList = [
    { title: 'Submit', classes: 'class-submit', click: jest.fn(), disabled: false, dismiss: false, order: 0 },
    { title: 'Close', classes: 'class-cancel', click: 'close', disabled: true, dismiss: false, order: 1 },
  ] as ModalButtonInterface[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [...CommonProvidersTestHelper(), importProvidersFrom(FinishModule)],
      declarations: [FinishWrapperComponent, StatusIconComponent],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(FinishWrapperComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('embeddedMode', true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });

    it('should load icon', () => {
      const loadIcons = jest.fn();
      (window as any).PayeverStatic = {
        SvgIconsLoader: {
          loadIcons: loadIcons,
        },
      };
      fixture.destroy();
      fixture = TestBed.createComponent(FinishWrapperComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(loadIcons).toHaveBeenCalled();
    });
  });

  describe('buttons', () => {
    it('should render all buttons correctly', () => {
      fixture.componentRef.setInput('buttons', buttonList);
      fixture.componentRef.setInput('isChangingPaymentMethod', false);
      fixture.componentRef.setInput('isPaymentAlreadySubmitted', false);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      buttons.map(({ nativeElement: button }, index) => {
        const buttonConfig = buttonList[index];
        expect(button).toBeTruthy();
        expect(button.type).toEqual('button');
        expect(button.className).toContain('btn btn-dark');
        expect(button.textContent).toContain(buttonConfig.title);
      });
    });

    it('should return empty buttons list if isChangingPaymentMethod true', () => {
      fixture.componentRef.setInput('buttons', buttonList);
      fixture.componentRef.setInput('isChangingPaymentMethod', true);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('button'))).toEqual([]);
    });

    it('should return empty buttons list if buttons is empty', () => {
      fixture.componentRef.setInput('buttons', null);
      fixture.componentRef.setInput('isChangingPaymentMethod', false);
      fixture.componentRef.setInput('isPaymentAlreadySubmitted', false);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('button'))).toEqual([]);
    });

    it('should return empty buttons list if isPaymentAlreadySubmitted true', () => {
      fixture.componentRef.setInput('buttons', buttonList);
      fixture.componentRef.setInput('isPaymentAlreadySubmitted', true);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('button'))).toEqual([]);
    });

    it('should handle button click', () => {
      jest.spyOn(component.close, 'emit');

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      buttons.map(({ nativeElement: button }, index) => {
        const buttonConfig = buttonList[index];
        button.click();
        if (buttonConfig.click === 'close') {
          expect(component.close.emit).toHaveBeenCalled();
        } else {
          expect(buttonConfig.click).toHaveBeenCalled();
        }
      });
    });
  });

  describe('loading state', () => {
    it('should show or hide loading base on loading / change payment', () => {
      fixture.componentRef.setInput('isLoading', true);
      fixture.componentRef.setInput('isChangingPaymentMethod', false);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.wait-block'))).toBeTruthy();

      fixture.componentRef.setInput('isLoading', false);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.wait-block'))).toBeNull();

      fixture.componentRef.setInput('isChangingPaymentMethod', true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.wait-block'))).toBeTruthy();
    });

    it('should show input processing text', () => {
      fixture.componentRef.setInput('isLoading', true);
      fixture.componentRef.setInput('isChangingPaymentMethod', false);
      fixture.componentRef.setInput('processingTitle', 'processingTitle');
      fixture.componentRef.setInput('processingText', 'processingText');
      fixture.detectChanges();
      const waitBlock = fixture.debugElement.query(By.css('.wait-block')).nativeElement;
      const header = fixture.debugElement.query(By.css('div.text-primary')).nativeElement;
      const details = fixture.debugElement.query(By.css('p.processing-note')).nativeElement;
      const loader = fixture.debugElement.query(By.css('.loader_48')).nativeElement;
      expect(waitBlock).toBeTruthy();
      expect(header.textContent).toEqual('processingTitle');
      expect(details.textContent).toEqual('processingText');
      expect(loader).toBeTruthy();
    });

    it('should show only loader if changing payment method', () => {
      fixture.componentRef.setInput('isChangingPaymentMethod', true);
      fixture.detectChanges();
      const header = fixture.debugElement.query(By.css('div.text-primary'));
      const details = fixture.debugElement.query(By.css('p.processing-note'));
      const loader = fixture.debugElement.query(By.css('.loader_48'));
      expect(header).toBeNull();
      expect(details).toBeNull();
      expect(loader).toBeTruthy();
    });
  });

  describe('error case', () => {
    it('should show error', () => {
      fixture.componentRef.setInput('errorMessage', 'error-text');
      fixture.componentRef.setInput('isPaymentAlreadySubmitted', false);
      fixture.detectChanges();

      const p = fixture.debugElement.query(By.css('p.text-warning')).nativeElement;
      const svg = fixture.debugElement.query(By.css('svg.icon-32')).nativeElement;
      const use = fixture.debugElement.query(By.css('use')).nativeElement;
      expect(p).toBeTruthy();
      expect(svg).toBeTruthy();
      expect(use.getAttribute('xlink:href')).toEqual('#icon-alert-32');

      const subheading = fixture.debugElement.query(By.css('.subheading')).nativeElement;
      const errorText = fixture.debugElement.query(By.css('.text-danger')).nativeElement;

      expect(subheading.textContent).toContain('checkout_sdk.finish.header.request_error');
      expect(errorText.textContent).toEqual('error-text');
    });

    it('should show non form errors', () => {
      jest.spyOn(NonFormErrorsService.prototype, 'getErrorsAsLines').mockReturnValue(['error-1', 'error-2']);
      fixture.componentRef.setInput('errorMessage', 'error-text');
      fixture.componentRef.setInput('isPaymentAlreadySubmitted', false);
      fixture.detectChanges();

      const errors = fixture.debugElement.queryAll(By.css('.text-danger'));

      expect(errors[0].nativeElement.textContent).toEqual('error-text');
      expect(errors[1].nativeElement.textContent).toEqual('error-1');
      expect(errors[2].nativeElement.textContent).toEqual('error-2');
    });
  });

  describe('success case', () => {
    it('should success finish if isPaymentAlreadySubmitted true', () => {
      fixture.componentRef.setInput('isPaymentAlreadySubmitted', true);
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.directive(StatusIconComponent)).componentInstance;
      const title = fixture.debugElement.query(By.css('p.text-primary')).nativeElement;
      expect(icon.status).toEqual('success');
      expect(title.textContent).toContain('checkout_sdk.finish_already_submitted.title');
    });
  });

  describe('component', () => {
    it('should update isDisableChangePayment', () => {
      component.asSinglePayment = true;
      expect(component.isDisableChangePayment).toBeTruthy();
      expect(component.asSinglePayment).toBeTruthy();
    });

    it('should emit close', () => {
      jest.spyOn(component.close, 'emit');
      component.onClose();
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should call onClose after button click', () => {
      jest.spyOn(component, 'onClose');
      component.onButtonClick(buttonList[1]);
      expect(component.onClose).toHaveBeenCalled();
    });

    it('should call button click after OnButtonClick', () => {
      component.onButtonClick(buttonList[0]);
      expect(buttonList[0].click).toHaveBeenCalled();
    });
  });
});
