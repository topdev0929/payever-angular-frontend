import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow, SetPayments, PaymentState, SetParams, ParamsState } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  flowWithPaymentOptionsFixture,
  paymentOptionsFixture,
  paymentFormFixture,
} from '../../../../../test/fixtures';
import { DetailsFormValue } from '../../../../common';

import { DetailsFormService } from './details-form.service';

describe('DetailsFormService', () => {

  let service: DetailsFormService;
  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        DetailsFormService,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: paymentFormFixture(),
          formOptions: paymentOptionsFixture(),
        },
      },
    }));
    store.dispatch(new SetParams({
      ...store.selectSnapshot(ParamsState),
      merchantMode: true,
    }));

    service = TestBed.inject(DetailsFormService);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });


  describe('defaultCondition', () => {
    const options = {
      conditions: [
        {
          description: 'ComfortCard plus 0% 12M (NEU)',
          programs: [
            {
              key: '0001134616001',
              program: '1',
            },
          ],
          isComfortCardCondition: true,
        },
        {
          description: 'Faktorenkredit',
          programs: [
            {
              key: '0001134610001',
              program: '1',
            },
          ],
          isComfortCardCondition: false,
        },
        {
          description: 'Sonderzinsprogramm',
          programs: [
            {
              key: '0001134609001',
              program: '1',
            },
            {
              key: '0001134609002',
              program: '2',
            },
            {
              key: '0001134609003',
              program: '3',
            },
          ],
          isComfortCardCondition: false,
        },
        {
          description: 'Standardfinanzierung',
          programs: [
            {
              key: '0001134608001',
              program: '1',
            },
            {
              key: '0001134608002',
              program: '2',
            },
            {
              key: '0001134608003',
              program: '3',
            },
            {
              key: '0001134608004',
              program: '4',
            },
            {
              key: '0001134608005',
              program: '5',
            },
          ],
          isComfortCardCondition: false,
        },
      ],
      defaultCondition: '0001134608005',
    };

    it('defaultCondition should be applied to initialDetailsForm', () => {
      jest.spyOn(service, 'detailsForm', 'get').mockReturnValue({} as DetailsFormValue);

      (service['options'] as any) = options;
      (service['defaultCondition'] as any) = options.defaultCondition;

      expect(service.initialDetailsForm).toMatchObject({
        _condition_view: 2,
        _program_view: '0001134608005',
      });
    });
  });

  it('should get detailsForm return details form from state', () => {

    expect(service.detailsForm).toEqual(paymentFormFixture().detailsForm);

  });

  it('should get initialDetailsForm return initial detail form', () => {

    jest.spyOn(service, 'isDefaultMerchantCondition')
      .mockReturnValue(true);

    const expectedDetailsFormValue: DetailsFormValue = {
      ...paymentFormFixture().detailsForm,
      _enableDesiredInstalment: true,
      _condition_view: paymentFormFixture().detailsForm._condition_view,
      condition: null,
      typeOfGuarantorRelation: paymentFormFixture().detailsForm.typeOfGuarantorRelation,
      _weekOfDelivery_view: paymentFormFixture().detailsForm._weekOfDelivery_view,
      dayOfFirstInstalment: paymentFormFixture().detailsForm.dayOfFirstInstalment,
    };

    expect(service.initialDetailsForm).toEqual(expectedDetailsFormValue);

  });


  it('should correctly process conditions', () => {

    const expectedConditions = paymentOptionsFixture().conditions.map((condition, index) => (
      {
        label: condition.description, value: index,
      }
    ));

    expect(service.conditions).toEqual(expectedConditions);

  });

  it('should isDefaultMerchantCondition return correct values', () => {

    expect(service.isDefaultMerchantCondition(paymentOptionsFixture().conditions,
      paymentOptionsFixture().conditions[0].programs[0].key)).toBeFalsy();
    expect(service.isDefaultMerchantCondition(paymentOptionsFixture().conditions,
      paymentOptionsFixture().conditions[2].programs[0].key)).toBeTruthy();

  });

  it('should return correct description for program', () => {

    expect(service['conditionDescriptionByProgram'](paymentOptionsFixture().conditions[1].programs[0].key))
      .toEqual(paymentOptionsFixture().conditions[1].description);

  });

  it('should return correct defaultConditionView', () => {

    expect(service.defaultConditionView(paymentOptionsFixture().conditions[1].programs[0].key)).toEqual(1);
    expect(service.defaultConditionView()).toEqual(2);

  });

});
