import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';

import { UIHeaderSantanderComponent } from './header-santander.component';

@Component({
  selector: 'finexp-ui-header-santander-test-component',
  template: `
    <finexp-ui-header-santander>text content</finexp-ui-header-santander>
  `,
})
class TestComponent { }

describe('finexp-ui-header-santander', () => {
  let testComponent: TestComponent;
  let componentEl: DebugElement;
  let fixture: ComponentFixture<TestComponent>;
  let component: InstanceType<typeof UIHeaderSantanderComponent>;

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
    componentEl = fixture.debugElement.query(By.directive(UIHeaderSantanderComponent));
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
          backgroundColor: '#ffffff',
          lineColor: '#eeeeee',
          mainTextColor: '#333333',
          regularTextColor: '#ffffff',
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
      expect(
        componentEl.query(By.css('.title'))?.nativeElement.innerHTML
      ).toContain('text content');
    });
  });
});

