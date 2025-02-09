import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { FinishStatusIconConfig } from '@pe/checkout/finish';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
} from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../../../test';

import { FinishMerchantStatusPendingComponent } from './merchant-status-pending.component';

describe('FinishMerchantStatusPendingComponent', () => {
  let component: FinishMerchantStatusPendingComponent;
  let fixture: ComponentFixture<FinishMerchantStatusPendingComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        FinishMerchantStatusPendingComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: FinishStatusIconConfig,
          useValue: {
            icons: {
              success: 'success-36',
              pending: 'pending-36',
              fail: 'error-36',
            },
            iconsClass: 'icon-36',
          },
        },
      ],
    });
  });

  beforeEach(() => {
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(FinishMerchantStatusPendingComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });

    it('should load icons on create', () => {
      const mockLoadIcons = jest.fn();
      (window as any).PayeverStatic = {
        SvgIconsLoader: {
          loadIcons: mockLoadIcons,
        },
      };
      fixture.destroy();
      fixture = TestBed.createComponent(FinishMerchantStatusPendingComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(mockLoadIcons).toHaveBeenCalledWith(
        ['new-progress-64'],
        null,
        component['customElementService'].shadowRoot
      );
    });
  });
});
