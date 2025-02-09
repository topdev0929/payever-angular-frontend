import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow, SetPayments } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { FormOptionsInterface } from '../../../shared';
import { flowWithPaymentOptionsFixture, paymentFormFixture, paymentOptionsFixture } from '../../../test/fixtures';

import { SummaryRatesPrimaryComponent } from './summary-rates-primary.component';

describe('SummaryRatesPrimaryComponent', () => {
  const storeHelper = new StoreHelper();

  let component: SummaryRatesPrimaryComponent;
  let fixture: ComponentFixture<SummaryRatesPrimaryComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        SummaryRatesPrimaryComponent,
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
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: paymentFormFixture(),
        },
      },
    }));


    fixture = TestBed.createComponent(SummaryRatesPrimaryComponent);
    component = fixture.componentInstance;

    component.formOptions = paymentOptionsFixture();
  });

  afterEach(() => {

    fixture?.destroy();
    jest.clearAllMocks();

  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should not initialize translations and rateData when rateData is not available', () => {
      jest.spyOn(component.paymentTranslations$, 'next');
      jest.spyOn(component.translations$, 'next');

      expect(component.paymentTranslations$.next).not.toHaveBeenCalled();
      expect(component.translations$.next).not.toHaveBeenCalled();
    });
    it('should initialize translations and rateData when rateData is available', () => {
      jest.spyOn(component.paymentTranslations$, 'next');
      jest.spyOn(component.translations$, 'next');

      component.ngOnInit();

      expect(component.paymentTranslations$.next).toHaveBeenCalled();
      expect(component.translations$.next).toHaveBeenCalled();
      expect(component['formData']).toEqual(paymentFormFixture());
    });
    it('should initialize translations branch', () => {
      const durationOne = {
        ...paymentFormFixture(),
        ratesForm: {
          ...paymentFormFixture().ratesForm,
          _rate: {
            ...paymentFormFixture().ratesForm._rate,
            duration: 1,
          },
        },
      };
      store.dispatch(new SetPayments({
        [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
          [flowWithPaymentOptionsFixture().connectionId]: {
            form: durationOne,
          },
        },
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(SummaryRatesPrimaryComponent);
      component = fixture.componentInstance;

      jest.spyOn(component.paymentTranslations$, 'next');
      jest.spyOn(component.translations$, 'next');

      component.ngOnInit();

      expect(component.paymentTranslations$.next).toHaveBeenCalled();
      expect(component.translations$.next).toHaveBeenCalled();
      expect(component['formData']).toEqual(durationOne);
    });
  });

  describe('getConditionTitle', () => {
    it('should return condition title with program text when program is found', () => {
      component.formOptions = {
        conditions: [
          { description: 'Condition1', programs: [{ key: 'program1', program: 'Program1' }] },
        ],
      } as FormOptionsInterface;

      const result = component.getConditionTitle('program1');

      expect(result).toEqual('Condition1');
    });

    it('should return condition if program more then 1', () => {
      component.formOptions = {
        conditions: [
          {
            description: 'Condition1',
            programs: [{ key: 'program1', program: 'program 1' }, { key: 'program2', program: 'program 2' }],
          },
        ],
      } as FormOptionsInterface;

      const result = component.getConditionTitle('program1');

      expect(result).toEqual('Condition1 (program 1)');
    });
  });
});
