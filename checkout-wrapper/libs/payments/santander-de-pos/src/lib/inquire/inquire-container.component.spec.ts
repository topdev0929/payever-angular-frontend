import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SectionDataInterface } from '@pe/checkout/form-utils';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow, SetSteps } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { FormConfigService, FormValue, GuarantorRelation, PaymentService } from '../shared';
import { flowWithPaymentOptionsFixture } from '../test';

import { InquiryContainerComponent } from './inquire-container.component';

describe('InquiryContainerComponent', () => {
  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputCurrencyModule,
      ],
      declarations: [
        InquiryContainerComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        AddressStorageService,
        FormConfigService,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
      ],
    });
  });

  beforeEach(() => {
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetSteps([]));

    fixture = TestBed.createComponent(InquiryContainerComponent);
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

  describe('ngOnInit', () => {
    it('should call loadStepperConfig', () => {
      const loadStepperConfigSpy = jest.spyOn(component as any, 'loadStepperConfig');
      component.ngOnInit();
      expect(loadStepperConfigSpy).toHaveBeenCalled();
    });

    it('should initialize forceHideAddressPanel based on store', () => {
      jest.spyOn(store, 'selectSnapshot').mockReturnValue(() => true);
      component.ngOnInit();
      expect(component.forceHideAddressPanel).toEqual(true);
    });

    it('should call initPaymentMethod from analyticsFormService', () => {
      const initPaymentMethodSpy = jest.spyOn(component['analyticsFormService'], 'initPaymentMethod');
      component.ngOnInit();
      expect(initPaymentMethodSpy).toHaveBeenCalledWith(PaymentMethodEnum.SANTANDER_POS_INSTALLMENT);
    });
  });

  describe('changePayment', () => {
    it('should dispatch ChangeFailedPayment action', () => {
      jest.spyOn(store, 'dispatch');
      const mockData = {};
      component.changePayment(mockData);
      expect(component['store'].dispatch).toHaveBeenCalled();
    });
  });

  describe('checkStepsLogic', () => {
    it('should update formSectionsData with the result of checkStepsLogic', () => {
      const mockFormSectionsData: SectionDataInterface[] = [
        {
          name: 'name',
          isActive: true,
          isSubmitted: false,
        },
      ];
      const mockTypeOfGuarantorRelation = GuarantorRelation.EQUIVALENT_HOUSEHOLD;
      component.initialData = {
        detailsForm: {
          typeOfGuarantorRelation: mockTypeOfGuarantorRelation,
        },
      } as FormValue;

      jest.spyOn(component['formConfigService'], 'checkStepsLogic');

      component.checkStepsLogic(mockFormSectionsData);

      expect(component['formConfigService'].checkStepsLogic).toHaveBeenCalledWith(
        mockTypeOfGuarantorRelation,
        mockFormSectionsData,
        component.forceHideAddressPanel,
        component['forceHideOcrPanel'],
      );
      expect(component.formSectionsData).toEqual(mockFormSectionsData);
    });

    it('should handle if detailsForm null', () => {
      const mockFormSectionsData: SectionDataInterface[] = [
        {
          name: 'name',
          isActive: true,
          isSubmitted: false,
        },
      ];
      component.initialData = {
        detailsForm: null,
      } as FormValue;

      jest.spyOn(component['formConfigService'], 'checkStepsLogic');

      component.checkStepsLogic(mockFormSectionsData);

      expect(component['formConfigService'].checkStepsLogic).toHaveBeenCalledWith(
        undefined,
        mockFormSectionsData,
        component.forceHideAddressPanel,
        component['forceHideOcrPanel'],
      );
      expect(component.formSectionsData).toEqual(mockFormSectionsData);
    });
  });

  describe('finishedModalShown', () => {
    it('should emit continue event when finished modal is shown', () => {
      const emitSpy = jest.spyOn(component.continue, 'emit');

      component.finishedModalShown(true);

      expect(emitSpy).toHaveBeenCalled();
    });
  });
});
