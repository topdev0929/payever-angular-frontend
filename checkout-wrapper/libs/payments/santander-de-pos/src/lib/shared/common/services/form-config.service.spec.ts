import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SectionDataInterface } from '@pe/checkout/form-utils';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test';
import { FormValue, GuarantorRelation, InquireSectionConfig } from '../types';

import { FormConfigService } from './form-config.service';

describe('FormConfigService', () => {
  let service: FormConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        FormConfigService,
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(FormConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sectionsConfig', () => {
    it('should return an array of section configurations', () => {
      const initialData = { /* mock initial data */ };
      const forceHideOcrPanel = false;

      const result = service.sectionsConfig(initialData, forceHideOcrPanel);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('wrapPersonTitle', () => {
    it('should wrap person title correctly', () => {
      const title = 'Test Title';
      const index = 1;

      const result = service.wrapPersonTitle(title, index);

      expect(result).toBe('Test Title');
    });
  });

  describe('getPersonTitlePostfix', () => {
    it('should return empty string if guarantorRelation is NONE', () => {
      const index = 1;

      const result = service.getPersonTitlePostfix(index);

      expect(result).toBe('');
    });

    it('should return correct postfix for other guarantorRelation values', () => {
      const index = 1;
      const initialData = {
        detailsForm: { typeOfGuarantorRelation: GuarantorRelation.EQUIVALENT_HOUSEHOLD },
      } as Partial<FormValue>;
      const expectedString = $localize`:@@payment-santander-de-pos.inquiry.steps.borrowerShort:${index}:personNumber:`

      service.initialData = initialData;

      const result = service.getPersonTitlePostfix(index);

      expect(result).toBe(` - ${expectedString}`);
    });
  });

  describe('checkStepsLogic', () => {
    it('should return an array of section data with updated isDisabled property', () => {
      const guarantorRelation = GuarantorRelation.OTHER_HOUSEHOLD;
      const formSectionsData = [{ name: InquireSectionConfig.IdentifyBorrower, isDisabled: false }];
      const forceHideAddressPanel = true;

      const result = service.checkStepsLogic(guarantorRelation, formSectionsData, forceHideAddressPanel);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].isDisabled).toBeDefined();
    });

    it('should return an empty array when formSectionsData is empty', () => {
      const guarantorRelation = GuarantorRelation.OTHER_HOUSEHOLD;
      const formSectionsData: SectionDataInterface[] = [];
      const forceHideAddressPanel = true;

      const result = service.checkStepsLogic(guarantorRelation, formSectionsData, forceHideAddressPanel);

      expect(result).toBeDefined();
      expect(result.length).toEqual(0);
    });

    it('should set disabled based on disabledSettings array', () => {
      const guarantorRelation = GuarantorRelation.NONE;
      const formSectionsData = [
        { name: InquireSectionConfig.IdentifyBorrower, isDisabled: false },
        { name: InquireSectionConfig.IdentifyGuarantor, isDisabled: false },
      ];
      const forceHideAddressPanel = true;
      const result = service.checkStepsLogic(guarantorRelation, formSectionsData, forceHideAddressPanel, false);

      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
      expect(result[1].isDisabled).toEqual(true);
    });
  });

  describe('disabledSettings', () => {
    it('should return an object with disabled settings based on provided conditions', () => {
      const isGuarantor = true;
      const guarantorRelation = GuarantorRelation.OTHER_HOUSEHOLD;
      const forceHideAddressPanel = false;
      const forceHideOcrPanel = false;

      const result = service['disabledSettings'](
        isGuarantor,
        guarantorRelation,
        forceHideAddressPanel,
        forceHideOcrPanel
      );

      expect(result).toBeDefined();
    });
  });
});
