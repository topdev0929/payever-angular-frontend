import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  QueryChildByDirective,
} from '@pe/checkout/testing';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';

import { UISantanderConsumerIconMediumComponent } from './santander-consumer-icon-medium.component';

describe('finexp-ui-santander-consumer-icon-medium', () => {
  let fixture: ComponentFixture<UISantanderConsumerIconMediumComponent>;
  let component: UISantanderConsumerIconMediumComponent;

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
    fixture = TestBed.createComponent(UISantanderConsumerIconMediumComponent);
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
    it('should render santander-icon', () => {
      const { child }= QueryChildByDirective(fixture, MatIcon);
 
      expect(child.svgIcon).toEqual('santander-consumer');      
    });
  });
});

