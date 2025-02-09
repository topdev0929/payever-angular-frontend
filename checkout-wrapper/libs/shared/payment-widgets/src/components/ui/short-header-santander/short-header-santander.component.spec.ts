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
import { UISantanderIconMediumComponent } from '../santander-icon-medium/santander-icon-medium.component';
import { UISantanderIconShortComponent } from '../santander-icon-short/santander-icon-short.component';

import { UIShortHeaderSantanderComponent } from './short-header-santander.component';

@Component({
  selector: 'finexp-ui-short-header-santander-test-component',
  template: `
    <finexp-ui-short-header-santander>text content</finexp-ui-short-header-santander>
  `,
})
class TestComponent {}

describe('finexp-ui-short-header-santander', () => {
  let testComponent: TestComponent;
  let componentEl: DebugElement;
  let fixture: ComponentFixture<TestComponent>;
  let component: InstanceType<typeof UIShortHeaderSantanderComponent>;

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
    componentEl = fixture.debugElement.query(By.directive(UIShortHeaderSantanderComponent));
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
      component.ngOnChanges();
      fixture.detectChanges();

      const host: HTMLElement = componentEl.nativeElement;
      expect(host.style.color).toEqual('rgb(136, 136, 136)');

      component.config = {
        styles: {
          regularTextColor: '#333333',
          backgroundColor: '#ffffff',
          lineColor: '#eeeeee',
          mainTextColor: '#333333',
          ctaTextColor: '#333333',
          buttonColor: '#e8e8e8',
          fieldBackgroundColor: '#ffffff',
          fieldLineColor: '#e8e8e8',
          fieldArrowColor: '#555555',
          headerTextColor: '#ffffff',
        },
      };
      component.ngOnChanges();
      fixture.detectChanges();

      expect(host.style.color).toEqual('rgb(255, 255, 255)');
    });
    it('should render content', () => {
      expect(componentEl.nativeElement.innerHTML).toContain('text content');
    });

    it('should render santander-icon', () => {
      component.logo = 'short';
      fixture.detectChanges();
      QueryChildByDirective(fixture, UISantanderIconShortComponent);
    });

    it('should render santander-icon', () => {
      component.logo = 'medium';
      fixture.detectChanges();
      QueryChildByDirective(fixture, UISantanderIconMediumComponent);
    });
  });
});

