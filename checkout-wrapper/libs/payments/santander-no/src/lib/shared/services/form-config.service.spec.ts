import { TestBed } from '@angular/core/testing';
import '@angular/localize/init';


import { SectionDataInterface } from '@pe/checkout/form-utils';
import { NodeFlowService } from '@pe/checkout/node-api';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { InquireSectionConfig } from '../../inquiry/lazy-payment-sections.config';
import { nodeResultFixture } from '../../test';

import { FormConfigService } from './form-config.service';
import { SantanderNoFlowService } from './santander-no-flow.service';



describe('FormConfigService', () => {

  let service: FormConfigService;
  let santanderNoFlowService: SantanderNoFlowService;
  let nodeFlowService: NodeFlowService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        FormConfigService,
        SantanderNoFlowService,
        NodeFlowService,
      ],
    });

    service = TestBed.inject(FormConfigService);
    santanderNoFlowService = TestBed.inject(SantanderNoFlowService);
    nodeFlowService = TestBed.inject(NodeFlowService);
  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should return correct sections config', () => {
    const expectedConfig = [
      {
        name: InquireSectionConfig.Additional,
        title: expect.any(String),
        isButtonHidden: true,
      },
      {
        name: InquireSectionConfig.CreditZ,
        title: expect.any(String),
        isButtonHidden: true,
      },
    ];

    expect(service.sectionsConfig()).toEqual(expectedConfig);
  });

  describe('disabledSettings', () => {
    it('should handle isNeedApproval true', () => {
      const isNeedApproval = jest.spyOn(santanderNoFlowService, 'isNeedApproval')
        .mockReturnValue(true);

      expect(service['disabledSettings']({ id: 'test' } as any))
        .toMatchObject({ [InquireSectionConfig.CreditZ]: false });
      expect(isNeedApproval).toHaveBeenCalledWith({ id: 'test' });
    });

    it('should handle isNeedApproval false', () => {
      const isNeedApproval = jest.spyOn(santanderNoFlowService, 'isNeedApproval')
        .mockReturnValue(false);

      expect(service['disabledSettings']({ id: 'test' } as any))
        .toMatchObject({ [InquireSectionConfig.CreditZ]: true });
      expect(isNeedApproval).toHaveBeenCalledWith({ id: 'test' });
    });

    it('should isNeedApproval handle if nodeResponse null', () => {
      const isNeedApproval = jest.spyOn(santanderNoFlowService, 'isNeedApproval')
        .mockReturnValue(false);

      expect(service['disabledSettings'](null))
        .toMatchObject({ [InquireSectionConfig.CreditZ]: true });
      expect(isNeedApproval).not.toHaveBeenCalled();
    });
  });
  describe('checkStepsLogic', () => {
    // public checkStepsLogic(
    //     flowId: string,
    //     formSectionsData: SectionDataInterface[],
    // ): Observable<SectionDataInterface[]> {
    //     if (!Array.isArray(formSectionsData)) {
    //     return of([]);
    //   }
    //   const nodeResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>
    //     = this.nodeFlowService.getFinalResponse();
    //   const disabledSettings = this.disabledSettings(nodeResponse);
    //
    //   return of(formSectionsData.map((section: SectionDataInterface<InquireSectionConfig>) => {
    //     if (disabledSettings[section.name] !== undefined) {
    //       section.isDisabled = disabledSettings[section.name];
    //     }
    //
    //     return section;
    //   }));
    // }
    const flowId = 'flow-id';

    it('should handle null form sections data', (done) => {
      service.checkStepsLogic(flowId, null).subscribe((data) => {
        expect(data).toEqual([]);
        done();
      });
    });

    it('should correct disable section settings', (done) => {
      const formSectionsData: SectionDataInterface[] = [
        {
          name: InquireSectionConfig.CreditZ,
          isActive: false,
          isSubmitted: false,
          isDisabled: false,
        },
        {
          name: InquireSectionConfig.Additional,
          isActive: false,
          isSubmitted: true,
          isDisabled: true,
        },
      ];

      const expectedResult: SectionDataInterface[] = [
        {
          name: InquireSectionConfig.CreditZ,
          isActive: false,
          isSubmitted: false,
          isDisabled: true,
        },
        {
          name: InquireSectionConfig.Additional,
          isActive: false,
          isSubmitted: true,
          isDisabled: true,
        },
      ];
      const nodePaymentResponse = nodeResultFixture();

      const getFinalResponse = jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue(nodePaymentResponse);
      const disabledSettings = jest.spyOn(service as any, 'disabledSettings')
        .mockReturnValue({ [InquireSectionConfig.CreditZ]: true });

      service.checkStepsLogic(flowId, formSectionsData).subscribe((data) => {
        expect(data).toEqual(expectedResult);
        expect(getFinalResponse).toHaveBeenCalled();
        expect(disabledSettings).toHaveBeenCalledWith(nodePaymentResponse);

        done();
      });
    });
  });
});
