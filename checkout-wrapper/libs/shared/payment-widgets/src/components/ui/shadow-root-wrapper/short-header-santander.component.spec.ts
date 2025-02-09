import { Component, DebugElement, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';

import { UIShadowRootWrapperComponent } from './shadow-root-wrapper.component';

@Component({
  selector: 'finexp-ui-shadow-root-wrapper-test-component',
  template: `
    <finexp-ui-shadow-root-wrapper>text content</finexp-ui-shadow-root-wrapper>
  `,
})
class TestComponent { }

describe('finexp-ui-shadow-root-wrapper', () => {
  let testComponent: TestComponent;
  let componentEl: DebugElement;
  let fixture: ComponentFixture<TestComponent>;
  let component: InstanceType<typeof UIShadowRootWrapperComponent>;

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
    }).overrideComponent(
      UIShadowRootWrapperComponent,
      {
        set: {
          encapsulation: ViewEncapsulation.Emulated,
        },
      }
    );
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    componentEl = fixture.debugElement.query(By.directive(UIShadowRootWrapperComponent));
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
      expect(component).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should render content', () => {
      expect(componentEl.nativeElement.innerHTML).toContain('text content');
    });
  });
});

