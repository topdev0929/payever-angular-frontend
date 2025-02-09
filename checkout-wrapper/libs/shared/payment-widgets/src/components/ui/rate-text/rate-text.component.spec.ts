import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  QueryChildByDirective,
} from '@pe/checkout/testing';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';
import { UILoadingRatesComponent } from '../loading-rates/loading-rates.component';
import { UIRateErrorComponent } from '../rate-error/rate-error.component';
import { UISelectedRateDetailsLineComponent } from '../selected-rate-details-line/selected-rate-details-line.component';
import { UISelectedRateDetailsComponent } from '../selected-rate-details/selected-rate-details.component';

import { UIRateTextComponent } from './rate-text.component';

@Component({
  selector: 'finexp-ui-rate-text-test-component',
  template: `
    <finexp-ui-rate-text>text content</finexp-ui-rate-text>
  `,
})
class TestComponent { }

describe('finexp-ui-rate-text', () => {
  let testComponent: TestComponent;
  let componentEl: DebugElement;
  let fixture: ComponentFixture<TestComponent>;
  let component: InstanceType<typeof UIRateTextComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentWidgetsSdkModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        TestComponent,
      ],
    });
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    componentEl = fixture.debugElement.query(By.directive(UIRateTextComponent));
    component = componentEl.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(testComponent).toBeTruthy();
      expect(componentEl).toBeTruthy();
      expect(component instanceof UIBaseComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('Should set the text color', () => {
      component.rate = {
        listTitle: 'listTitle',
        selectedTitle: 'selectedTitle',
        selectedMultiTitles: [],
        details: [],
        value: 'value',
        raw: {},
        isOneLine: false,
        isDefault: false,
      };
      component.ngOnChanges();
      fixture.detectChanges();
      const rateText = fixture.debugElement.query(By.css('.rate-text'));


      const host: HTMLElement = rateText.nativeElement;

      expect(host.style.color).toEqual('rgb(51, 51, 51)');
    });

    it('No rates available', () => {
      fixture.detectChanges();
      const { childEl } = QueryChildByDirective(fixture, UIRateErrorComponent);
      expect(childEl.nativeElement.innerHTML).toEqual('No rates available');
    });

    it('on error', () => {
      component.error = 'unexpected errror';
      fixture.detectChanges();
      const { childEl } = QueryChildByDirective(fixture, UIRateErrorComponent);
      expect(childEl.nativeElement.innerHTML).toEqual('unexpected errror');
    });

    it('isLoading', () => {
      component.isLoading = true;
      fixture.detectChanges();
      QueryChildByDirective(fixture, UILoadingRatesComponent);
    });

    it('should render content', () => {
      component.rate = {
        listTitle: 'listTitle',
        selectedTitle: 'selectedTitle',
        selectedMultiTitles: [],
        details: [],
        value: 'value',
        raw: {},
        isOneLine: false,
        isDefault: false,
      };
      fixture.detectChanges();
      const rateText = fixture.debugElement.query(By.css('.rate-text'));
      expect(rateText).toBeTruthy();
      expect(rateText.nativeElement.innerHTML).toContain('text content');


      QueryChildByDirective(fixture, UISelectedRateDetailsComponent);
    });

    it('should render rate-details-line', () => {
      component.rate = {
        listTitle: 'listTitle',
        selectedTitle: 'selectedTitle',
        selectedMultiTitles: [],
        details: [],
        value: 'value',
        raw: {},
        isOneLine: true,
        isDefault: false,
      };
      fixture.detectChanges();

      QueryChildByDirective(fixture, UISelectedRateDetailsLineComponent);
    });
  });
});

