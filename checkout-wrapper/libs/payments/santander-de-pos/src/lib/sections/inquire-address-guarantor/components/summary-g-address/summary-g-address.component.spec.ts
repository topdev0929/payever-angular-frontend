import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { PatchFormState, SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { SummaryGuarantorAddressComponent } from './summary-g-address.component';

describe('SummaryGuarantorAddressComponent', () => {
  const storeHelper = new StoreHelper();

  let component: SummaryGuarantorAddressComponent;
  let fixture: ComponentFixture<SummaryGuarantorAddressComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        SummaryGuarantorAddressComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchFormState({
      guarantor: {},
    }));

    fixture = TestBed.createComponent(SummaryGuarantorAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });
});
