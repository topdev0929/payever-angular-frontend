import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';

import { UILoadingRatesComponent } from './loading-rates.component';

describe('finexp-ui-loading-rates', () => {
  let fixture: ComponentFixture<UILoadingRatesComponent>;
  let component: UILoadingRatesComponent;

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
    fixture = TestBed.createComponent(UILoadingRatesComponent);
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
});

