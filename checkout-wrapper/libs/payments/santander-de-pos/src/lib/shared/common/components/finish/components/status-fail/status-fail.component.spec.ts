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

import { FinishStatusFailComponent } from './status-fail.component';

describe('FinishStatusFailComponent', () => {
  let component: FinishStatusFailComponent;
  let fixture: ComponentFixture<FinishStatusFailComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        FinishStatusFailComponent,
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

    fixture = TestBed.createComponent(FinishStatusFailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });
});
