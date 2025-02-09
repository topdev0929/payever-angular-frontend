import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockModule } from 'ng-mocks';

import { StorageModule } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { UtilsModule } from '@pe/checkout/utils';

import { SharedModule } from '../../shared.module';
import { RateInterface } from '../types';

import { BaseRateComponent } from './base-rate.component';


@Component({
  selector: 'extends-base-rate',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ExtendsBaseRateComponent extends BaseRateComponent {
  flowId: string;

  public getRate = this.getRateByFormData;
}

describe('BaseRateComponent', () => {
  let instance: ExtendsBaseRateComponent;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CommonModule,
        UtilsModule,
        StorageModule,
        MockModule(SharedModule),
      ],
      providers: [
        { provide: ChangeDetectorRef, useValue: {} },
        ...CommonProvidersTestHelper(),
        ExtendsBaseRateComponent,
      ],
      declarations: [
        ExtendsBaseRateComponent,
      ],
    });
    instance = TestBed.inject(ExtendsBaseRateComponent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('component', () => {
    it('Should extend AbstractRatesContainerComponent', () => {
      expect(instance instanceof BaseRateComponent).toBeTruthy();
    });

    it('Should return the matching rate on getRateByFormData', () => {
      const formData: RateInterface[] = [
        {
          annualFee: 0,
          baseInterestRate: 0,
          billingFee: 0,
          code: 'rate-code-0',
          effectiveInterest: 0,
          monthlyCost: 0,
          months: 0,
          payLaterType: false,
          startupFee: 0,
          totalCost: 0,
        },
        {
          annualFee: 1,
          baseInterestRate: 1,
          billingFee: 1,
          code: 'rate-code-1',
          effectiveInterest: 1,
          monthlyCost: 1,
          months: 1,
          payLaterType: false,
          startupFee: 1,
          totalCost: 1,
        },
      ];

      expect(instance.getRate(
        { campaignCode: 'rate-code-1' },
        formData,
      )).toEqual(formData[1]);
      expect(instance.getRate(
        { campaignCode: 'rate-code-2' },
        formData,
      )).toBeFalsy();
    });
  });
});
