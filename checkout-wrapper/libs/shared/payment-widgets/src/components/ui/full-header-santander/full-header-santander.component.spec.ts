import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';

import { UIFullHeaderSantanderComponent } from './full-header-santander.component';

@Component({
  selector: 'finexp-ui-full-header-santander-test-component',
  template: `
    <finexp-ui-full-header-santander>
      <ng-container topContent>
        top content
      </ng-container>
      text content
    </finexp-ui-full-header-santander>
  `,
})
class TestComponent { }

describe('finexp-ui-full-header-santander', () => {
  let testComponent: TestComponent;
  let componentEl: DebugElement;
  let fixture: ComponentFixture<TestComponent>;
  let component: InstanceType<typeof UIFullHeaderSantanderComponent>;

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
    componentEl = fixture.debugElement.query(By.directive(UIFullHeaderSantanderComponent));
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

    it('should render content', () => {
      expect(
        componentEl.query(By.css('.top-row'))?.nativeElement.innerHTML
      ).toContain('top content');
      expect(
        componentEl.query(By.css('.main-row'))?.nativeElement.innerHTML
      ).toContain('text content');
    });
  });
});
