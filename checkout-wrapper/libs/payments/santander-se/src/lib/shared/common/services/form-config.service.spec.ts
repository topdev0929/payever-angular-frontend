import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentSpecificStatusEnum, PaymentStatusEnum, SalesScoringType } from '@pe/checkout/types';

import { PaymentResponseWithStatus } from '../../../test/fixtures';
import { InquireSectionConfig, SantanderSeApplicationResponse } from '../types';

import { FormConfigService } from './form-config.service';
import { SantanderSeFlowService } from './santander-se-flow.service';



describe('FormConfigService', () => {
  let instance: FormConfigService;


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FormConfigService,
        MockProvider(SantanderSeFlowService),
        MockProvider(NodeFlowService),
      ],
      declarations: [
      ],
    });
    instance = TestBed.inject(FormConfigService);
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('checkStepsLogic', () => {
    it('Should return [] if inputs is not an array', async () => {
      const result = await instance.checkStepsLogic('fow-id', null).toPromise();
      expect(result).toEqual([]);
    });

    it('Should disable EBA if not authorized', async () => {
      const applicationData: SantanderSeApplicationResponse = {
        salesScoringType: SalesScoringType.New,
        name: 'test user',
      };
      jest.spyOn(TestBed.inject(SantanderSeFlowService), 'getApplicationFromCache')
        .mockReturnValue(of(applicationData));
      jest.spyOn(TestBed.inject(NodeFlowService), 'getFinalResponse')
        .mockReturnValue(
          PaymentResponseWithStatus(
            PaymentStatusEnum.STATUS_IN_PROCESS,
            PaymentSpecificStatusEnum.STATUS_SANTANDER_IN_PROGRESS,
          )
        );
      const sections = await instance.checkStepsLogic('flow-id', [
        {
          name: InquireSectionConfig.InquireAml,
        },
        {
          name: InquireSectionConfig.InquireEba,
        },
      ]).toPromise();

      expect(sections).toEqual([
        {
          name: InquireSectionConfig.InquireAml,
          isDisabled: false,
        },
        {
          name: InquireSectionConfig.InquireEba,
          isDisabled: true,
        },
      ]);
    });
  });

  it('Should disable EBA and AML if authorized', async () => {
    const applicationData: SantanderSeApplicationResponse = {
      salesScoringType: SalesScoringType.Authorization,
      name: 'test user',
    };
    jest.spyOn(TestBed.inject(SantanderSeFlowService), 'getApplicationFromCache')
      .mockReturnValue(of(applicationData));
    jest.spyOn(TestBed.inject(NodeFlowService), 'getFinalResponse')
      .mockReturnValue(
        PaymentResponseWithStatus(
          PaymentStatusEnum.STATUS_IN_PROCESS,
          PaymentSpecificStatusEnum.STATUS_SANTANDER_IN_PROGRESS,
        )
      );
    const sections = await instance.checkStepsLogic('flow-id', [
      {
        name: InquireSectionConfig.InquireAml,
      },
      {
        name: InquireSectionConfig.InquireEba,
      },
    ]).toPromise();

    expect(sections).toEqual([
      {
        name: InquireSectionConfig.InquireAml,
        isDisabled: true,
      },
      {
        name: InquireSectionConfig.InquireEba,
        isDisabled: true,
      },
    ]);
  });

  it('Should disable not EBA if not authorized and needs more info', async () => {
    const applicationData: SantanderSeApplicationResponse = {
      salesScoringType: SalesScoringType.New,
      name: 'test user',
    };
    const santanderSeFlowService =TestBed.inject(SantanderSeFlowService);
    jest.spyOn(santanderSeFlowService, 'getApplicationFromCache')
      .mockReturnValue(of(applicationData));
    jest.spyOn(santanderSeFlowService, 'isNeedMoreInfo')
      .mockReturnValue(true);
    jest.spyOn(TestBed.inject(NodeFlowService), 'getFinalResponse')
      .mockReturnValue(
        PaymentResponseWithStatus(
          PaymentStatusEnum.STATUS_DECLINED,
          PaymentSpecificStatusEnum.NEED_MORE_INFO,
        )
      );
    const sections = await instance.checkStepsLogic('flow-id', [
      {
        name: InquireSectionConfig.InquireAml,
      },
      {
        name: InquireSectionConfig.InquireEba,
      },
    ]).toPromise();

    expect(sections).toEqual([
      {
        name: InquireSectionConfig.InquireAml,
        isDisabled: false,
      },
      {
        name: InquireSectionConfig.InquireEba,
        isDisabled: false,
      },
    ]);
  });
});
