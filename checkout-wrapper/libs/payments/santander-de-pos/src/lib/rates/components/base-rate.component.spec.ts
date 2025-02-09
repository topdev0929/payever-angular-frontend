
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { AbstractRatesContainerComponent } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { RatesCalculationApiService, RatesCalculationService } from '../../shared';
import { flowWithPaymentOptionsFixture, ratesFixture } from '../../test';

import { BaseRateComponent } from './base-rate.component';

@Component({
    selector: 'extends-base-component',
    template: '<div></div>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

class ExtendsBaseContainerComponent extends BaseRateComponent {
    flowId: string;
}

describe('BaseRateComponent', () => {
    let fixture: ComponentFixture<ExtendsBaseContainerComponent>;
    let component: ExtendsBaseContainerComponent;

    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                PaymentInquiryStorage,
                RatesCalculationService,
                RatesCalculationApiService,
            ],
            declarations: [
                ExtendsBaseContainerComponent,
            ],
        });
        store = TestBed.inject(Store);
        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
        fixture = TestBed.createComponent(ExtendsBaseContainerComponent);
        component = fixture.componentInstance;
    });

    describe('Constructor', () => {
        it('Should create an instance', () => {
            expect(component).toBeTruthy();
            expect(component instanceof AbstractRatesContainerComponent).toBeTruthy();
        });
    });

    describe('getRateByFormData', () => {
        it('should return the correct rate when initialData is provided', () => {
            const initialData = { creditDurationInMonths: 12 };
            const rates = ratesFixture();

            const result = component['getRateByFormData'](initialData, rates);

            expect(result).toEqual(rates[0]);
        });

        it('should return undefined when initialData is not provided', () => {
            const initialData: any = null;
            const rates = ratesFixture();

            const result = component['getRateByFormData'](initialData, rates);

            expect(result).toBeUndefined();
        });
    });
});
