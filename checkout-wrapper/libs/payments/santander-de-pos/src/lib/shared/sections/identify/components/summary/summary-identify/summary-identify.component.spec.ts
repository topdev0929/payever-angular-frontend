import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import {
  PERSON_TYPE,
  PersonTypeEnum,
  BaseSummaryComponent,
} from '@pe/checkout/santander-de-pos/shared';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../../../test/fixtures';
import { IdentifyModule } from '../../../identify.module';

import { SummaryIdentifyComponent } from './summary-identify.component';


describe('SummaryIdentifyComponent', () => {

  let component: SummaryIdentifyComponent;
  let fixture: ComponentFixture<SummaryIdentifyComponent>;

  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(IdentifyModule),
        {
          provide: PERSON_TYPE,
          useValue: PersonTypeEnum.Customer,
        },
      ],
      declarations: [
        SummaryIdentifyComponent,
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should create an instance', () => {

    fixture = TestBed.createComponent(SummaryIdentifyComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component instanceof BaseSummaryComponent).toBe(true);

  });

  it('should identifyFormValue return personal form', () => {

    jest.spyOn(store, 'selectSnapshot').mockReturnValue(paymentFormFixture());

    fixture = TestBed.createComponent(SummaryIdentifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.identifyFormValue).toEqual(
      paymentFormFixture()[PersonTypeEnum.Customer].personalForm,
    );

  });

  it('should identifyFormValue return empty object if personal form not found', () => {
    jest.spyOn(store, 'selectSnapshot').mockReturnValue({
      ...paymentFormFixture(),
      [PersonTypeEnum.Customer]: {
        personalForm: null,
      },
    });

    fixture = TestBed.createComponent(SummaryIdentifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.identifyFormValue).toEqual({});
  });

});
