import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  QueryChildByDirective,
} from '@pe/checkout/testing';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';
import { UIPayeverIconComponent } from '../payever-icon/payever-icon.component';

import { UIFooterPoweredByPayeverComponent } from './footer-powered-by-payever.component';

describe('finexp-ui-footer-powered-by-payever', () => {
  let fixture: ComponentFixture<UIFooterPoweredByPayeverComponent>;
  let component: UIFooterPoweredByPayeverComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentWidgetsSdkModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
    });
    fixture = TestBed.createComponent(UIFooterPoweredByPayeverComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component instanceof UIBaseComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should payever-logo', () => {
      QueryChildByDirective(fixture, UIPayeverIconComponent);
    });
  });
});

