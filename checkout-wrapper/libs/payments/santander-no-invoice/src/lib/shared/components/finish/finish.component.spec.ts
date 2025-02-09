import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';

import {
    FinishStatusFailComponent,
    FinishStatusSuccessComponent,
    FinishStatusUnknownComponent,
} from '@pe/checkout/finish/components';
import { SetFlow } from '@pe/checkout/store';
import {
    CommonImportsTestHelper,
    CommonProvidersTestHelper,
    FinishDeclarationsTestHelper,
    FinishProvidersTestHelper,
} from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, nodeResultFixture } from '../../../test';

import { FinishComponent } from './finish.component';

describe('FinishComponent', () => {
    let component: FinishComponent;
    let fixture: ComponentFixture<FinishComponent>;
    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            declarations: [
                ...FinishDeclarationsTestHelper(),
                FinishComponent,
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                ...FinishProvidersTestHelper(),
            ],
        });
    });

    beforeEach(() => {
        registerLocaleData(de.default);
        store = TestBed.inject(Store);
        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

        fixture = TestBed.createComponent(FinishComponent);
        component = fixture.componentInstance;
    });

    beforeEach(() => {
        component.nodeResult = nodeResultFixture();
        component.embeddedMode = true;
        component.isLoading = false;
        component.isChangingPaymentMethod = false;
        component.errorMessage = '';
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('constructor', () => {
        it('Should check if component defined', () => {
            expect(component).toBeDefined();
        });
    });

    describe('isStatusSuccess', () => {
        it('should return true for success status', () => {
            fixture.detectChanges();

            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);

            expect(component.isStatusSuccess()).toBe(true);
        });

        it('should return false for other statuses', () => {
            fixture.detectChanges();

            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);

            expect(component.isStatusSuccess()).toBe(false);
        });
    });

    describe('isStatusPending', () => {
        it('should return true for pending status', () => {
            component.payment = {
                apiCall: {
                    pendingUrl: 'https://pending.com',
                },
            };

            fixture.detectChanges();

            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_IN_PROCESS);

            expect(component.isStatusPending()).toBe(true);
        });

        it('should return false for other statuses', () => {
            fixture.detectChanges();

            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);

            expect(component.isStatusPending()).toBe(false);
        });
    });

    describe('isStatusFail', () => {
        it('should return true for fail status', () => {
            fixture.detectChanges();

            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);

            expect(component.isStatusFail()).toBe(true);
        });

        it('should return false for other statuses', () => {
            fixture.detectChanges();

            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);

            expect(component.isStatusFail()).toBe(false);
        });
    });

    describe('Template', () => {
        it('should display success component for success status', () => {
            jest.spyOn(component, 'isStatusSuccess')
                .mockReturnValue(true);

            fixture.detectChanges();

            const successComponent = fixture.debugElement.query(By.directive(FinishStatusSuccessComponent));

            expect(successComponent).toBeTruthy();
        });

        it('should display fail component for fail status', () => {
            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);
            
            fixture.detectChanges();

            const failComponent = fixture.debugElement.query(By.directive(FinishStatusFailComponent));

            expect(failComponent).toBeTruthy();
        });

        it('should display unknown component for unknown status', () => {
            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue('unknown_status' as PaymentStatusEnum);

            fixture.detectChanges();

            const unknownComponent = fixture.debugElement.query(By.directive(FinishStatusUnknownComponent));

            expect(unknownComponent).toBeTruthy();
        });
    });
});
