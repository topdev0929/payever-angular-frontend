import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';

import { SummaryAmlComponent } from './summary-aml.component';

describe('pe-santander-se-inquire-aml', () => {
  const storeHelper = new StoreHelper();

  let component: SummaryAmlComponent;
  let fixture: ComponentFixture<SummaryAmlComponent>;
  let store: Store;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        SummaryAmlComponent,
      ],
    });
    storeHelper.setMockData();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryAmlComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });


  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });
});

