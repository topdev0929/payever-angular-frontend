import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  QueryChildByDirective,
} from '@pe/checkout/testing';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';

import { UIPayeverIconComponent } from './payever-icon.component';

describe('finexp-ui-payever-icon', () => {
  let fixture: ComponentFixture<UIPayeverIconComponent>;
  let component: UIPayeverIconComponent;

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
    fixture = TestBed.createComponent(UIPayeverIconComponent);
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
      const { child }= QueryChildByDirective(fixture, MatIcon);
 
      expect(child.svgIcon).toEqual('payever');
    });
  });
});

