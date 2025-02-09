import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { LAZY_PAYMENT_SECTIONS } from '@pe/checkout/form-utils';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { ChangeFailedPayment, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { prepareData } from '@pe/checkout/utils/prepare-data';

import { FormConfigService, NodePaymentDetailsInterface } from '../../../shared';
import { flowWithPaymentOptionsFixture, paymentFormFixture, paymentOptionsFixture } from '../../../test';

import { InquiryContainerComponent } from './inquiry-container.component';

jest.mock('@pe/checkout/utils/prepare-data', () => ({
  ...jest.requireActual('@pe/checkout/utils/prepare-data'),
  prepareData: jest.fn(),
}));


describe('InquiryContainerComponent', () => {

  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;

  let store: Store;
  let formConfigService: FormConfigService;
  let nodeFlowService: NodeFlowService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [InquiryContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        AddressStorageService,
        FormConfigService,
        NodeFlowService,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
        { provide: LAZY_PAYMENT_SECTIONS, useValue: {} },
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: paymentFormFixture(),
          formOptions: paymentOptionsFixture(),
        },
      },
    }));
    formConfigService = TestBed.inject(FormConfigService);
    nodeFlowService = TestBed.inject(NodeFlowService);


    fixture = TestBed.createComponent(InquiryContainerComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should call loadSectionsConfig on init', () => {

    const loadSectionsConfigSpy = jest.spyOn(component as any, 'loadSectionsConfig')
      .mockReturnValue(null);

    component.ngOnInit();

    expect(loadSectionsConfigSpy).toHaveBeenCalledTimes(1);

  });

  it('should load sectionsConfig on init', () => {

    const sectionsConfigSpy = jest.spyOn(formConfigService, 'sectionsConfig')
      .mockReturnValue(null);

    component.ngOnInit();

    expect(sectionsConfigSpy).toHaveBeenCalledTimes(1);

  });

  it('should dispatch ChangeFailedPayment at changePayment method', () => {

    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const changePaymentData = { redirectUrl: 'https://redirect-url.com' };

    component.changePayment(changePaymentData);

    expect(dispatchSpy).toHaveBeenCalledWith(new ChangeFailedPayment(changePaymentData));

  });

  it('should call sendPaymentData at onSubmit', () => {

    const sendPaymentDataSpy = jest.spyOn(component as any, 'sendPaymentData')
      .mockReturnValue(null);

    component.onSubmit();

    expect(sendPaymentDataSpy).toHaveBeenCalledTimes(1);

  });

  describe('sendPaymentData', () => {
    const expectedResult: Partial<NodePaymentDetailsInterface> = {
      wantsSafeInsurance: false,
      insuranceForUnemployment: false,
      payWithMainIncome: false,
      wasCPRProcessed: false,
      wasTaxProcessed: false,
      children: [],
      cars: [],
      purposeOfLoan: '',
      marketingSmsConsent: false,
      marketingEmailConsent: false,
      allowCreditStatusLookUp: false,
      childrenLivingHome: 0,
      carsHousehold: 0,
      productConsent: true,
    };
    let prepareDataSpy: jest.SpyInstance;
    let setPaymentDetails: jest.SpyInstance;

    beforeEach(() => {
      setPaymentDetails = jest.spyOn(nodeFlowService, 'setPaymentDetails');
      prepareDataSpy = (prepareData as jest.Mock)
        .mockReturnValue({});
    });

    it('should update nodePaymentDetails correctly before submit', () => {
      component['sendPaymentData']();

      expect(prepareDataSpy).toHaveBeenCalledWith(paymentFormFixture());
      expect(setPaymentDetails).toHaveBeenCalledWith(expectedResult);
    });

    it('should correctly update cars type before submit', () => {
      const cars: any = [
        {
          age: 10, monthlyExpense: 1000, financedType: 0, financedTypeView: {
            title: 'title-0', value: 0, label: 'label-0', index: 0,
          },
        },
        {
          age: 10, monthlyExpense: 1000, financedType: 10, financedTypeView: {
            title: 'title-0', value: 0, label: 'label-0', index: 0,
          },
        },
      ];
      const expectedResultWithCars: Partial<NodePaymentDetailsInterface> = {
        ...expectedResult,
        cars,
        carsHousehold: 2,
      };
      prepareDataSpy.mockReturnValue({ cars });

      component['sendPaymentData']();

      expect(prepareDataSpy).toHaveBeenCalledWith(paymentFormFixture());
      expect(setPaymentDetails).toHaveBeenCalledWith(expectedResultWithCars);
    });
  });


});
