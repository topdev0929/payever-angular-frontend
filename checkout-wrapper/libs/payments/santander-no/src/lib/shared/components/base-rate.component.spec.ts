
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { AbstractRatesContainerComponent } from '@pe/checkout/payment';
import { StorageModule } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../test';
import { RatesCalculationApiService, RatesCalculationService } from '../services';
import { RateInterface } from '../types';

import { BaseRateComponent } from './base-rate.component';

@Component({
    selector: 'extends-base-rate-component',
    template: '<div></div>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class ExtendsBaseRateComponent extends BaseRateComponent {
    flowId: string;
}

describe('BaseRateComponent', () => {
    const rate = { campaignCode: 'someCampaignCode' } as RateInterface;
    const rates = [
        { campaignCode: 'someCampaignCode' },
        { campaignCode: 'otherCampaignCode' },
    ] as RateInterface[];

    let fixture: ComponentFixture<ExtendsBaseRateComponent>;
    let component: ExtendsBaseRateComponent;

    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
                StorageModule,
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                RatesCalculationApiService,
                RatesCalculationService,
            ],
            declarations: [
                ExtendsBaseRateComponent,
            ],
        });
        store = TestBed.inject(Store);
        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
        fixture = TestBed.createComponent(ExtendsBaseRateComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        jest.clearAllMocks();
        fixture?.destroy();
    });

    describe('Constructor', () => {
        it('Should create an instance', () => {
            expect(component).toBeTruthy();
            expect(component instanceof AbstractRatesContainerComponent).toBeTruthy();
        });
    });

    describe('makeRateId', () => {
        it('should return null if rate is null', () => {
            const result = component.makeRateId(null);
            expect(result).toBeNull();
        });

        it('should return the campaignCode of the rate', () => {
            const rate = { campaignCode: 'someCampaignCode' } as RateInterface;
            const result = component.makeRateId(rate);
            expect(result).toEqual(rate.campaignCode);
        });
    });

    describe('getRateByFormData', () => {
        it('should return the rate with matching campaignCode', () => {
            const result = component['getRateByFormData'](rate, rates);
            expect(result).toEqual(rates[0]);
        });
    });
});
